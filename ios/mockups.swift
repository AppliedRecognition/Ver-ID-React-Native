//
//  mockups.swift
//  ReactNativePluginVerid
//
//  Created by Jonathan Matus Moreno on 7/14/20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation

struct Mockups {
    // Mockups for testing
    
    static func getAttachmentMockup() -> String {
        let faceMockup : String = self.getFaceMockup()
        var mockup = "{\"attachments\": [";
        mockup += "{\"recognizableFace\": " + faceMockup + ", \"image\": \"TESTING_IMAGE\", \"bearing\": \"STRAIGHT\"}";
        mockup += "]}";
        
        return mockup
    }
    
    static func getFaceMockup() -> String {
        var faceMockup : String = "{\"x\":-8.384888,\"y\":143.6514,\"width\":331.54974,\"height\":414.43723,\"yaw\":-0.07131743,";
        faceMockup += "\"pitch\":-6.6307373,\"roll\":-2.5829313,\"quality\":9.658932,";
        faceMockup += "\"leftEye\":[101,322.5],\"rightEye\":[213,321],";
        faceMockup += "\"data\":\"TESTING_DATA\",";
        faceMockup += "\"faceTemplate\":{\"data\":\"FACE_TEMPLATE_TEST_DATA\",\"version\":1}}";
        
        return faceMockup;
    }
}
