import UIKit
import VerIDCore
import VerIDUI

@objc(ReactNativePluginVerId)
class ReactNativePluginVerId: NSObject, VerIDFactoryDelegate, VerIDSessionDelegate {

    private var resolveCallback: RCTPromiseResolveBlock?
    private var rejectCallback: RCTPromiseRejectBlock?
    private var verid: VerID?
    private var TESTING_MODE: Bool = false

    @objc(detectFaceInImage:resolver:rejecter:)
    func detectFaceInImage(image: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void{
        self.loadVerID(nil) { verid in
             DispatchQueue.global(qos: .userInitiated).async {
                do {
                    if (image == "") {
                        throw VerIDPluginError.invalidArgument
                    }
                    let imageString = image

                    guard imageString.starts(with: "data:image/"), let mimeTypeEndIndex = imageString.firstIndex(of: ";"), let commaIndex = imageString.firstIndex(of: ",") else {
                        throw VerIDPluginError.invalidArgument
                    }
                    let dataIndex = imageString.index(commaIndex, offsetBy: 1)
                    guard String(imageString[mimeTypeEndIndex..<imageString.index(mimeTypeEndIndex, offsetBy: 7)]) == ";base64" else {
                        throw VerIDPluginError.invalidArgument
                    }
                    guard let data = Data(base64Encoded: String(imageString[dataIndex...])) else {
                        throw VerIDPluginError.invalidArgument
                    }
                    guard let image = UIImage(data: data), let cgImage = image.cgImage else {
                        throw VerIDPluginError.invalidArgument
                    }
                    let orientation: CGImagePropertyOrientation
                    switch image.imageOrientation {
                    case .up:
                        orientation = .up
                    case .down:
                        orientation = .down
                    case .left:
                        orientation = .left
                    case .right:
                        orientation = .right
                    case .upMirrored:
                        orientation = .upMirrored
                    case .downMirrored:
                        orientation = .downMirrored
                    case .leftMirrored:
                        orientation = .leftMirrored
                    case .rightMirrored:
                        orientation = .rightMirrored
                    @unknown default:
                        orientation = .up
                    }
                    let veridImage = VerIDImage(cgImage: cgImage, orientation: orientation)
                    let faces = try verid.faceDetection.detectFacesInImage(veridImage, limit: 1, options: 0)
                    guard let recognizableFace = try verid.faceRecognition.createRecognizableFacesFromFaces(faces, inImage: veridImage).first else {
                        throw VerIDPluginError.faceTemplateExtractionError
                    }
                    let encodableFace = CodableFace(face: faces[0], recognizable: recognizableFace)
                    guard let encodedFace = String(data: try JSONEncoder().encode(encodableFace), encoding: .utf8) else {
                        throw VerIDPluginError.encodingError
                    }
                    self.dispatchAsyncResolve(encodedFace, resolve)
                } catch {
                     self.dispatchAsyncError(VerIDPluginError.parsingError, error.localizedDescription, error, reject)
                }
            }
        }
    }

    @objc(compareFaces:face2:resolver:rejecter:)
    func compareFaces(face1: String, face2: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        if face1 != "", face2 != "", let t1 = face1.data(using: .utf8), let t2 = face2.data(using: .utf8) {
            self.loadVerID(nil) { verid in
                 DispatchQueue.global(qos: .userInitiated).async {
                    do {


                        let template1 = try JSONDecoder().decode(CodableFace.self, from: t1).recognizable
                        let template2 = try JSONDecoder().decode(CodableFace.self, from: t2).recognizable
                        let score = try verid.faceRecognition.compareSubjectFaces([template1], toFaces: [template2]).floatValue
                        DispatchQueue.main.async {
                            let message: [String:Any] = ["score":score,"authenticationThreshold":verid.faceRecognition.authenticationScoreThreshold.floatValue,"max":verid.faceRecognition.maxAuthenticationScore.floatValue];
                            self.dispatchAsyncResolve(message, resolve)
                        }
                    } catch {
                        self.dispatchAsyncError(VerIDPluginError.parsingError, error.localizedDescription, error, reject)
                    }
                }
            }
        } else {
            self.dispatchAsyncError(VerIDPluginError.invalidArgument, "Unable to parse template1 and/or template2 arguments", nil, reject)
        }
    }

    @objc(deleteUser:resolver:rejecter:)
    func deleteUser(userId: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        if userId != "" {
            self.loadVerID(nil) { verid in
                verid.userManagement.deleteUsers([userId]) { error in
                    if let err = error {
                       self.dispatchAsyncError(VerIDPluginError.sessionError, err.localizedDescription, err, reject)
                        return
                    }
                   self.dispatchAsyncResolve("OK", resolve)
                }
            }
        } else {
            self.dispatchAsyncError(VerIDPluginError.parsingError, "Unable to parse userId argument", nil, reject)
        }
    }

    @objc(getRegisteredUsers:rejecter:)
    func getRegisteredUsers(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        if self.TESTING_MODE {
            let users = "[\"user1\", \"user2\", \"user3\"]"
            self.dispatchAsyncResolve(users, resolve)
        } else {
            self.loadVerID(nil) { verid in
                var err: String = "Unknown error"
                do {
                    let users = try verid.userManagement.users()
                    if let usersString = String(data: try JSONEncoder().encode(users), encoding: .utf8) {
                        self.dispatchAsyncResolve(usersString, resolve)
                        return
                    } else {
                        err = "Failed to encode JSON as UTF-8 string"
                    }
                } catch {
                    err = error.localizedDescription
                }
                self.dispatchAsyncError(VerIDPluginError.sessionError, err, nil, reject)
            }
        }
    }

    @objc(captureLiveFace:resolver:rejecter:)
    func captureLiveFace(SettingsConfig: Any, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        if self.TESTING_MODE {
            self.dispatchAsyncResolve(Mockups.getAttachmentMockup(), resolve)
        } else {
            do {
                self.setCallbacks(resolve, reject)
                let settings: LivenessDetectionSessionSettings = try self.createSettings(SettingsConfig as! [Any])
                self.startSession(settings: settings)
            } catch {
                 self.dispatchAsyncError(VerIDPluginError.sessionError, error.localizedDescription, error, reject)
            }
        }
    }

    @objc(authenticate:resolver:rejecter:)
    func authenticate(SettingsConfig: Any, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        if self.TESTING_MODE {
            self.dispatchAsyncResolve(Mockups.getAttachmentMockup(), resolve)
        } else {
            do {
                self.setCallbacks(resolve, reject)
                let settings: AuthenticationSessionSettings = try self.createSettings(SettingsConfig as! [Any])
                self.startSession(settings: settings)
            } catch {
                self.dispatchAsyncError(VerIDPluginError.sessionError, error.localizedDescription, error, reject)
            }
        }
    }

    @objc(registerUser:resolver:rejecter:)
    func registerUser(SettingsConfig: Any, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        if self.TESTING_MODE {
            self.dispatchAsyncResolve(Mockups.getAttachmentMockup(), resolve)
        } else {
            do {
                self.setCallbacks(resolve, reject)
                let settings: RegistrationSessionSettings = try self.createSettings(SettingsConfig as! [Any])
                self.startSession(settings: settings)
            } catch {
                self.dispatchAsyncError(VerIDPluginError.sessionError, error.localizedDescription, error, reject)
            }
        }
    }

    @objc(unload:rejecter:)
    func unload(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        self.verid = nil
        self.dispatchAsyncResolve("OK", resolve)
    }

    @objc(loadWithPassword:resolver:rejecter:)
    func loadWithPassword(password: String, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        self.setCallbacks(resolve, reject)
        DispatchQueue.global(qos: .userInitiated).async {
            self.loadVerID (password) {verid in
                resolve(verid)
            }
        }
    }

    @objc(load:rejecter:)
    func load(resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        self.setCallbacks(resolve, reject)
        DispatchQueue.global(qos: .userInitiated).async {
            self.loadVerID (nil) {verid in
                resolve(verid)
            }
        }
    }

    // MARK: - VerID Testing methods
    @objc(setTestingMode:resolver:rejecter:)
    func setTestingMode(mode: ObjCBool, resolve:@escaping RCTPromiseResolveBlock, reject:@escaping RCTPromiseRejectBlock) -> Void {
        self.TESTING_MODE = mode.boolValue
        self.dispatchAsyncResolve("OK, testing mode set to: \(mode)", resolve)
    }



    // MARK: - VerID Session Delegate

    public func session(_ session: VerIDSession, didFinishWithResult result: VerIDSessionResult) {
        guard let reject = self.rejectCallback, let resolve = self.resolveCallback else {
            return
        }
        self.resetCallbacks()

        var err = "Unknown error"
        do {
            if let message = String(data: try JSONEncoder().encode(result), encoding: .utf8) {
                self.dispatchAsyncResolve(message, resolve)
                return
            } else {
                err = "Unabe to encode JSON as UTF-8 string"
            }
        } catch {
            err = error.localizedDescription
        }
        self.dispatchAsyncError(VerIDPluginError.sessionError, err, nil, reject)
    }

    public func sessionWasCanceled(_ session: VerIDSession) {
        guard let reject = self.rejectCallback else {
            return
        }
        self.resetCallbacks()
        self.dispatchAsyncError(VerIDPluginError.sessionError, "OK", nil, reject)
    }

    // MARK: - Session helpers

    private func createSettings<T: VerIDSessionSettings>(_ args: [Any]?) throws -> T {
        guard let string = args?.compactMap({ ($0 as? [String:String])?["settings"] }).first, let data = string.data(using: .utf8) else {
            NSLog("Unable to parse settings")
            throw VerIDPluginError.parsingError
        }
        let settings: T = try JSONDecoder().decode(T.self, from: data)
        NSLog("Decoded settings %@ from %@", String(describing: T.self), string)
        return settings
    }

    private func defaultSettings<T: VerIDSessionSettings>() -> T {
        switch T.self {
        case is RegistrationSessionSettings.Type:
            return RegistrationSessionSettings(userId: "default") as! T
        case is AuthenticationSessionSettings.Type:
            return AuthenticationSessionSettings(userId: "default") as! T
        case is LivenessDetectionSessionSettings.Type:
            return LivenessDetectionSessionSettings() as! T
        default:
            return VerIDSessionSettings() as! T
        }
    }

    private func startSession<T: VerIDSessionSettings>(settings: T) {
        self.loadVerID(nil) { verid in
            let session = VerIDSession(environment: verid, settings: settings)
            session.delegate = self
            session.start()
        }
    }

    func loadVerID(_ password: String?, callback: @escaping (VerID) -> Void) {
        if let verid = self.verid {
            callback(verid)
            return
        }
        let veridFactory: VerIDFactory
        if let passwordAPI = password {
            veridFactory = VerIDFactory(veridPassword: passwordAPI)
        } else {
            veridFactory = VerIDFactory()
        }
        veridFactory.delegate = self
        veridFactory.createVerID()
    }


    // MARK: - VerID Factory Delegate

    public func veridFactory(_ factory: VerIDFactory, didCreateVerID instance: VerID) {
        if let resolve = self.resolveCallback {
            self.verid = instance
            self.resetCallbacks()
            self.dispatchAsyncResolve(instance, resolve)
        }
    }

    public func veridFactory(_ factory: VerIDFactory, didFailWithError error: Error) {
        if let reject = self.rejectCallback {
            self.verid = nil
            self.resetCallbacks()
            self.dispatchAsyncError(VerIDPluginError.sessionError, error.localizedDescription, error, reject)
        }
    }

    // MARK: - Utils methods

    private func resetCallbacks() -> Void {
        self.resolveCallback = nil
        self.rejectCallback = nil
    }

    private func setCallbacks(_ resolver:@escaping RCTPromiseResolveBlock, _ rejecter: @escaping RCTPromiseRejectBlock) {
        self.resolveCallback = resolver
        self.rejectCallback = rejecter
    }


    private func dispatchAsyncResolve(_ result: Any, _ resolveCallback: @escaping RCTPromiseResolveBlock) -> Void {
        DispatchQueue.global(qos: .userInitiated).async {
            resolveCallback(result)
        }
    }

    private func dispatchAsyncError(_ errorType: VerIDPluginError, _ errorMessage: String, _ error: Error?, _ rejectCallback: @escaping RCTPromiseRejectBlock) -> Void {
        DispatchQueue.global(qos: .userInitiated).async {
            rejectCallback("Error \(errorType.localizedDescription)", errorMessage, error)
        }
    }
}

public enum VerIDPluginError: Int, Error {
    case parsingError, invalidArgument, encodingError, faceTemplateExtractionError, sessionError
}

class CodableFace: NSObject, Codable {

    enum CodingKeys: String, CodingKey {
        case data, faceTemplate, height, leftEye, pitch, quality, rightEye, roll, width, x, y, yaw
    }

    enum FaceTemplateCodingKeys: String, CodingKey {
        case data, version
    }

    let face: Face
    let recognizable: Recognizable

    init(face: Face, recognizable: Recognizable) {
        self.face = face
        self.recognizable = recognizable
    }

    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.face = Face()
        self.face.data = try container.decode(Data.self, forKey: .data)
        self.face.leftEye = try container.decode(CGPoint.self, forKey: .leftEye)
        self.face.rightEye = try container.decode(CGPoint.self, forKey: .rightEye)
        self.face.bounds = CGRect(x: try container.decode(CGFloat.self, forKey: .x), y: try container.decode(CGFloat.self, forKey: .y), width: try container.decode(CGFloat.self, forKey: .width), height: try container.decode(CGFloat.self, forKey: .height))
        self.face.angle = EulerAngle(yaw: try container.decode(CGFloat.self, forKey: .yaw), pitch: try container.decode(CGFloat.self, forKey: .pitch), roll: try container.decode(CGFloat.self, forKey: .roll))
        self.face.quality = try container.decode(CGFloat.self, forKey: .quality)
        let faceTemplateContainer = try container.nestedContainer(keyedBy: FaceTemplateCodingKeys.self, forKey: .faceTemplate)
        self.recognizable = RecognitionFace(recognitionData: try faceTemplateContainer.decode(Data.self, forKey: .data))
        self.recognizable.version = try faceTemplateContainer.decode(Int32.self, forKey: .version)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.face.data, forKey: .data)
        try container.encode(self.face.leftEye, forKey: .leftEye)
        try container.encode(self.face.rightEye, forKey: .rightEye)
        try container.encode(self.face.quality, forKey: .quality)
        try container.encode(self.face.bounds.minX, forKey: .x)
        try container.encode(self.face.bounds.minY, forKey: .y)
        try container.encode(self.face.bounds.width, forKey: .width)
        try container.encode(self.face.bounds.height, forKey: .height)
        try container.encode(self.face.angle.yaw, forKey: .yaw)
        try container.encode(self.face.angle.pitch, forKey: .pitch)
        try container.encode(self.face.angle.roll, forKey: .roll)
        var faceTemplateContainer = container.nestedContainer(keyedBy: FaceTemplateCodingKeys.self, forKey: .faceTemplate)
        try faceTemplateContainer.encode(self.recognizable.recognitionData, forKey: .data)
        try faceTemplateContainer.encode(self.recognizable.version, forKey: .version)
    }
}
