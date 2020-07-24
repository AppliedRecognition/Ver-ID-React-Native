import { LivenessDetectionSessionSettings } from './LivenessDetectionSessionSettings';
/**
 * Settings for authentication sessions
 */
export class AuthenticationSessionSettings extends LivenessDetectionSessionSettings {
    /**
     * ID of the user to authenticate
     */
    userId: string;

    /**
     * @param userId ID of the user to authenticate
     */
    constructor(userId: string) {
        super();
        this.userId = userId;
    }
}
