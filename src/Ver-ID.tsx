import { VerID, PluginVerId } from './classes/VerID';
export { AuthenticationSessionSettings } from './classes/AuthenticationSessionSettings';
export { LivenessDetectionSessionSettings } from './classes/LivenessDetectionSessionSettings';
export { RegistrationSessionSettings } from './classes/RegistrationSessionSettings';
export { VerIDSessionSettings } from './classes/VerIDSessionSettings';
export { Error } from './classes/Error';
export { DetectedFace } from './classes/DetectedFace';
export { Face } from './classes/Face';
export { FaceComparisonResult } from './classes/FaceComparisonResult';
export { FaceTemplate } from './classes/FaceTemplate';
export { SessionResult } from './classes/SessionResult';
export { Bearing } from './classes/Bearing';

/**
 * Load Ver-ID
 * @param password Ver-ID API password (if omitted the library will look in the app's plist (iOS) or manifest (Android))
 * @returns Promise whose resolve function's argument contains the loaded Ver-ID instance
 * @example
 * ```typescript
 *
 * verid.load().then(instance => {
 *    // You can now call instance methods
 * }).catch(error => {
 *    // Load failed
 * });
 * ```
 */
export function load(password?: string): Promise<VerID> {
    return new Promise<VerID>((resolve, reject) => {
        const resolveFn = () => {
            var verid = new VerID();
            resolve(verid);
        };
        if (password !== undefined) {
            PluginVerId.loadWithPassword(password).then(resolveFn).catch(reject);
        } else {
            PluginVerId.load().then(resolveFn).catch(reject);
        }
    });
}

/**
 * Unload Ver-ID
 * @returns Promise
 */
export function unload(): Promise<void> {
    return PluginVerId.unload();
}
/**
 * Set testing mode
 * @param mode used to set the testing mode on or off
 */
export function setTestingMode(mode: boolean): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if (typeof mode === 'boolean') {
            PluginVerId.setTestingMode(mode).then(resolve).catch(reject);
        } else {
            reject('Invalid Parameter');
        }
    });
}
