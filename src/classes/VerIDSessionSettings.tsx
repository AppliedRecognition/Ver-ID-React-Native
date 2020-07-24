/**
 * Base class for Ver-ID session settings
 */
export class VerIDSessionSettings {
    /**
     * Time it will take for the session to expire (in seconds)
     */
    expiryTime: number = 30.0;
    /**
     * The number of detected faces and images the session must collect before finishing
     */
    numberOfResultsToCollect: number = 2;
    /**
     * Set to `true` to display the result of the session to the user
     */
    showResult: boolean = false;
}
