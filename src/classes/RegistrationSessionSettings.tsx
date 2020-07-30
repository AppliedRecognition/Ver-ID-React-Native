import { VerIDSessionSettings } from './VerIDSessionSettings';
import { Bearing } from './Bearing';
/**
 * Settings for registration sessions
 */
export class RegistrationSessionSettings extends VerIDSessionSettings {
    /**
     * ID of the user to register
     */
    userId: string;
    /**
     * Bearings to register in this session
     *
     * @note The number of faces to register is determined by the {@linkcode VerIDSessionSettings.numberOfResultsToCollect} parameter. If the number of results to collect exceeds the number of bearings to register the session will start take the next bearing from the beginning of the bearings array.
     *
     * For example, a session with bearings to register set to `[Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT]` and `numberOfResultsToCollect` set to `2` will register faces with bearings: `[Bearing.STRAIGHT, Bearing.LEFT]`.
     *
     * A session with bearings to register set to ```[Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT]` and `numberOfResultsToCollect` set to `2` will register faces with bearings: `[Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT, Bearing.STRAIGHT]`.
     */
    bearingsToRegister: Bearing[] = [Bearing.STRAIGHT, Bearing.LEFT, Bearing.RIGHT];

    /**
     * @param userId ID of the user whose faces should be registered
     */
    constructor(userId: string) {
        super();
        this.userId = userId;
        this.numberOfResultsToCollect = 1;
    }
}
