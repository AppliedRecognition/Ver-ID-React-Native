import { Bearing } from './Bearing';
import { Face } from './Face';
/**
 * Face detected during a session
 */
export class DetectedFace {
    /**
     * Detected face
     */
    recognizableFace: Face = new Face();
    /**
     * Detected face bearing
     */
    bearing: Bearing = Bearing.DOWN;
    /**
     * Image encoded using [data URI scheme](https://en.wikipedia.org/wiki/Data_URI_scheme)
     */
    image: string = '';
}
