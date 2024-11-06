type Tube = { x: number; y: number };
type TubeField = Array<Tube>;

export class TubeSheet {
    private _OTLClearance: number;
    private _tubeOD: number;
    private _pitchRatio: number;
    private _layout: number | string;
    private _minID: number | null;
    private _numTubes: number | null;
    private _tubeField: TubeField | null;
    private _minTubes?: number;
    private _shellID?: number;

    public constructor(
        OTLClearance: number,
        tubeOD: number,
        pitchRatio: number,
        layout: number | string,
        minTubes?: number,
        shellID?: number
    ) {
        this._minTubes = minTubes;
        this._shellID = shellID;
        this._OTLClearance = OTLClearance;
        this._tubeOD = tubeOD;
        this._pitchRatio = pitchRatio;
        this._layout = layout;
        this._minID = null;
        this._numTubes = null;
        this._tubeField = null;
        this.updateGeneratedProps();
    }

    set OTLClearance(x: number) {
        this._OTLClearance = x;
        this.updateGeneratedProps();
    }
    get OTLClearance() {
        return this._OTLClearance;
    }

    set tubeOD(x: number) {
        this._tubeOD = x;
        this.updateGeneratedProps();
    }
    get tubeOD() {
        return this._tubeOD;
    }

    set pitchRatio(x: number) {
        this._pitchRatio = x;
        this.updateGeneratedProps();
    }
    get pitchRatio() {
        return this._pitchRatio;
    }

    set layout(x: number | string) {
        this._layout = x;
        this.updateGeneratedProps();
    }
    get layout() {
        return this._layout;
    }

    set minTubes(x: number) {
        this._minTubes = x;
        this.updateGeneratedProps();
    }
    get minTubes() {
        return this._minTubes as number;
    }

    set shellID(x: number) {
        this._shellID = x;
        this.updateGeneratedProps();
    }
    get shellID() {
        return this._shellID as number;
    }

    get tubeField() {
        return this._tubeField;
    }

    get minID() {
        return this._minID;
    }

    get numTubes() {
        return this._numTubes;
    }

    get OTL() {

        if (this._minID !== null && typeof this._shellID !== "undefined") {
            return Math.min(this._minID, this._shellID) - this._OTLClearance;
        }

        if (this._minID !== null) {
            return this._minID - this._OTLClearance;
        } else return null;
    }

    get svg() {
        let shellIDForSVG = 0;
        if (this._tubeField !== null && this.OTL !== null) {
            if (
                typeof this._shellID !== "undefined" &&
                this._shellID !== 0 &&
                !isNaN(this._shellID)
            ) {
                shellIDForSVG = this._shellID;
            } else if (this._minID !== null && this._minID !== 0) {
                shellIDForSVG = this._minID;
            }
            const svgElement = generateTubeSheetSVG(
                this._tubeField,
                this._tubeOD,
                shellIDForSVG,
                this.OTL
            );
            return svgElement;
        } else return document.createElementNS("http://www.w3.org/2000/svg", "svg");
    }

    private updateGeneratedProps() {
        this._minID = this.minIDFunc();
        this._numTubes = this.numTubesFunc();
        this._tubeField = this.tubeFieldFunc();
    }

    private tubeFieldFunc(): TubeField | null {
        if (this._shellID) {
            return generateTubeField(
                this._shellID,
                this._OTLClearance,
                this._tubeOD,
                this._pitchRatio,
                this._layout
            );
        } else if (this._minTubes) {
            return generateTubeField(
                this.minIDFunc() as number,
                this._OTLClearance,
                this._tubeOD,
                this._pitchRatio,
                this._layout
            );
        } else {
            return null;
        }
    }

    private minIDFunc(): number | null {
        if (this._minTubes) {
            return findMinID(
                this._minTubes,
                this._OTLClearance,
                this._tubeOD,
                this._pitchRatio,
                this._layout
            );
        } else if (this._shellID) {
            return findMinID(
                this.numTubesFunc(),
                this._OTLClearance,
                this._tubeOD,
                this._pitchRatio,
                this._layout
            );
        } else {
            return null;
        }
    }

    private numTubesFunc(): number {
        if (this._shellID) {
            return tubeCount(
                this._shellID,
                this._OTLClearance,
                this._tubeOD,
                this._pitchRatio,
                this._layout
            );
        } else if (this._minTubes) {
            return tubeCount(
                this.minIDFunc() as number,
                this._OTLClearance,
                this._tubeOD,
                this._pitchRatio,
                this._layout
            );
        } else {
            return 0;
        }
    }
}

function roundUp(value: number, precision: number): number {
    const multiplier = Math.pow(10, precision);
    return Math.ceil(value * multiplier) / multiplier;
}

function generateTubeField(
    shellID: number,
    OTLClearance: number,
    tubeOD: number,
    pitchRatio: number,
    layout: number | string,
    offsetOption: string = "AUTO"
): TubeField | null {
    // On Error GoTo errHandler

    try {
        // Input validation
        if (shellID <= 0 || tubeOD <= 0 || pitchRatio <= 1 || OTLClearance < 0) {
            throw new Error("Invalid input parameters");
        }

        if (tubeOD >= shellID - OTLClearance) {
            throw new Error("Tube OD exceeds shell ID");
        }

        shellID = roundUp(shellID, 8);

        const MAX_ITERATIONS = 999999;
        let Pt: number;
        let dx: number;
        let dy: number;
        let C: number;
        let MaxOTL: number;
        let tempTubeField: TubeField = [];
        let idealOffsetOption: boolean;

        // Calculate constants
        Pt = tubeOD * pitchRatio;
        MaxOTL = shellID - OTLClearance;

        // Calculate dx, dy and per-row offset based on selected layout
        switch (typeof layout === "string" ? layout.toLowerCase() : layout) {
            case 30:
                dx = Pt;
                dy = (Pt * Math.sqrt(3)) / 2; //Pt * sin(60°) = Pt * Math.sqrt(3) / 2
                C = dx * 0.5;
                break;
            case 60:
                dx = Pt * Math.sqrt(3); //Pt * sin(60°) * 2
                dy = Pt / 2;
                C = dx * 0.5;
                break;
            case 90:
                dx = Pt;
                dy = Pt;
                C = 0;
                break;
            case 45:
                dx = Pt * Math.sqrt(2); //Pt * 2 / cos(45°)
                dy = dx / 2;
                C = dx * 0.5;
                break;
            case "radial":
                return radialFunc(shellID, OTLClearance, tubeOD, pitchRatio);

            default: //catch invalid input as error
                throw new Error("Invalid layout option");
        }

        // Recursively find optimal layout if offsetOption is set to AUTO.
        // Otherwise, respect offsetOption arg input.

        if (offsetOption === "AUTO") {
            if (
                tubeCount(shellID, OTLClearance, tubeOD, pitchRatio, layout, "True") >
                tubeCount(shellID, OTLClearance, tubeOD, pitchRatio, layout, "False")
            ) {
                idealOffsetOption = true;
            } else {
                idealOffsetOption = false;
            }
        } else if (offsetOption === "True") {
            idealOffsetOption = true;
        } else {
            idealOffsetOption = false;
        }

        let offset = idealOffsetOption ? dx / 2 : 0;
        let i = 0,
            j = 0,
            x = 0,
            y = 0;
        let goNextRow: Boolean = false;

        while (Math.abs(y) <= MaxOTL && j < MAX_ITERATIONS) {
            y = j * dy;
            while (Math.abs(x) <= MaxOTL && i < MAX_ITERATIONS && !goNextRow) {
                let cMult = j % 2 === 0 ? 0 : 1;
                x = C * cMult + i * dx - offset;
                if (Math.sqrt(x ** 2 + y ** 2) * 2 + tubeOD <= MaxOTL) {
                    tempTubeField.push({ x: x, y: y });
                } else {
                    goNextRow = true;
                }
                i++;
            }
            i = 0;
            j++;
            goNextRow = false;
        }

        function applySymmetry(tubeField: TubeField): TubeField {
            const flipHorz: number[][] = [
                [-1, 0],
                [0, 1],
            ];

            const flipVert: number[][] = [
                [1, 0],
                [0, -1],
            ];

            function applyMatrix(point: Tube, matrix: number[][]): Tube {
                const x = point.x;
                const y = point.y;

                return {
                    x: x * matrix[0][0] + y * matrix[0][1],
                    y: x * matrix[1][0] + y * matrix[1][1],
                };
            }

            const flippedHorz = tubeField.map((point) => applyMatrix(point, flipHorz));
            const flippedVert = mergeUniqueCoordinates(tubeField, flippedHorz).map((point) =>
                applyMatrix(point, flipVert)
            );

            function mergeUniqueCoordinates(...arrays: TubeField[]): TubeField {
                const merged = arrays.flat(1);

                // Create a Set to hold unique tube positions based on JSON stringified coordinates
                const uniqueSet = new Set(merged.map((item) => JSON.stringify(item)));

                return Array.from(uniqueSet).map((item) => JSON.parse(item));
            }

            function sortTubePositions(tubeField: TubeField): TubeField {
                return tubeField.sort((a, b) => {
                    if (a.y === b.y) {
                        return a.x - b.x; // Sort by x if y is the same
                    }
                    return a.y - b.y; // Otherwise, sort by y
                });
            }

            // Merge and deduplicate tube positions
            const mergedFields = mergeUniqueCoordinates(tubeField, flippedHorz, flippedVert);

            // Sort the final tube positions
            return sortTubePositions(mergedFields);
        }

        tempTubeField = applySymmetry(tempTubeField);

        return tempTubeField;
    } catch (error) {
        console.error((error as Error).message);
        return null;
    }
}

function radialFunc(
    shellID: number,
    OTLClearance: number,
    tubeOD: number,
    pitchRatio: number
): TubeField {
    let Pt = tubeOD * pitchRatio;
    let MaxOTL = shellID - OTLClearance;
    let numTubes = Math.floor(Math.PI / Math.asin(Pt / (MaxOTL - tubeOD)));
    let angleIncrement = (2 * Math.PI) / numTubes;
    let centreD = Pt / Math.sin(Math.PI / numTubes);
    let tempTubeField: TubeField = [];

    for (let i = 0; i < numTubes; i++) {
        let x: number, y: number;
        if (i === 0) {
            x = 0;
            y = centreD / 2;
        } else {
            let angle = angleIncrement * i * -1 + Math.PI / 2;
            x = (centreD / 2) * Math.cos(angle);
            y = (centreD / 2) * Math.sin(angle);
        }
        tempTubeField.push({ x: x, y: y });
    }

    return tempTubeField;
}

function tubeCount(
    shellID: number,
    OTLClearance: number,
    tubeOD: number,
    pitchRatio: number,
    layout: number | string,
    offsetOption: string = "AUTO"
): number {
    let tubeField = generateTubeField(
        shellID,
        OTLClearance,
        tubeOD,
        pitchRatio,
        layout,
        offsetOption
    );
    // console.log(`Tube count: ${tubeField ? tubeField.length : 0} for offsetOption = ${offsetOption}`)
    return tubeField ? tubeField.length : 0;
}

function tubeFieldOTL(
    shellID: number,
    OTLClearance: number,
    tubeOD: number,
    pitchRatio: number,
    layout: number | string,
    offsetOption: string = "AUTO"
): number | null | undefined {
    try {
        // Input validation
        if (tubeOD >= shellID - OTLClearance) {
            throw new Error("Invalid input");
        }

        const tubeField = generateTubeField(
            shellID,
            OTLClearance,
            tubeOD,
            pitchRatio,
            layout,
            offsetOption
        );
        if (tubeField) {
            let D = 0;
            let D_new = 0;
            // let x: number, y: number
            tubeField.forEach((tube) => {
                if ("x" in tube && "y" in tube) {
                    let x = tube.x;
                    let y = tube.y;
                    // Calculate the new diameter
                    D_new = Math.sqrt(x ** 2 + y ** 2) * 2 + tubeOD;
                    if (D_new > D) {
                        D = D_new;
                    }
                }
            });
            // Round up and return the OTL
            if (D === 0) {
                throw new Error("Invalid tube field array");
            }
            return roundUp(D, 11);
        }
    } catch (error) {
        console.log((error as Error).message);
        return null;
    }
}

function findMinID(
    minTubes: number,
    OTLClearance: number,
    tubeOD: number,
    pitchRatio: number,
    layout: number | string,
    offsetOption: string = "AUTO"
): number {
    const maxRetries: number = 5;
    let retries: number = 0;

    let D_old: number;
    let D_new: number;
    let D_bestGuess: number | undefined;
    let D_check: number;
    let beta: number;
    let i: number;
    let numTubes_old: number;
    let numTubes_new: number;
    let numTubes_bestGuess: number | undefined;
    let numTubes_check: number;
    // let tubeFieldArr: TubeField
    const max_i: number = 100;

    if (tubeOD <= 0 || pitchRatio <= 1 || OTLClearance < 0) {
        throw new Error("Invalid input");
    }
    // shortcircuit when target number of tubes = 1
    if (minTubes === 1) {
        return roundUp(tubeOD + OTLClearance, 8);
    }

    while (true) {
        try {
            if ((typeof layout === "string" ? layout.toLowerCase() : layout) !== "radial") {
                if (offsetOption.toUpperCase() !== "AUTO") {
                    i = 0;
                    beta = 1.1; // iteration multiplier when solution has not yet been bounded

                    // Initialise guesses depending on selected layout
                    if (layout === 30 || layout === 60) {
                        if (offsetOption === "True") {
                            D_old = Math.max(
                                tubeOD * pitchRatio * Math.sqrt(minTubes / 0.84) + OTLClearance,
                                tubeOD * pitchRatio * 2 + OTLClearance + 0.1
                            );
                        } else {
                            D_old = Math.max(
                                tubeOD * pitchRatio * Math.sqrt(minTubes / 0.84) + OTLClearance,
                                tubeOD + OTLClearance + 0.1
                            );
                        }
                    } else {
                        if (offsetOption === "True") {
                            D_old = Math.max(
                                tubeOD * pitchRatio * Math.sqrt(minTubes / 0.61) + OTLClearance,
                                Math.sqrt(
                                    (tubeOD * pitchRatio) ** 2 + ((tubeOD * pitchRatio) / 2) ** 2
                                ) *
                                2 +
                                OTLClearance +
                                0.1
                            );
                        } else {
                            D_old = Math.max(
                                tubeOD * pitchRatio * Math.sqrt(minTubes / 0.61) + OTLClearance,
                                tubeOD + OTLClearance + 0.1
                            );
                        }
                    }

                    // Increase diameter guess until valid tubefield is obtained
                    while (
                        tubeFieldOTL(
                            D_old,
                            OTLClearance,
                            tubeOD,
                            pitchRatio,
                            layout,
                            offsetOption
                        ) === null
                    ) {
                        D_old = D_old * beta;
                    }

                    // Save first guess of tube count into memory
                    D_old =
                        tubeFieldOTL(
                            D_old,
                            OTLClearance,
                            tubeOD,
                            pitchRatio,
                            layout,
                            offsetOption
                        )! + OTLClearance;
                    numTubes_old = tubeCount(
                        D_old,
                        OTLClearance,
                        tubeOD,
                        pitchRatio,
                        layout,
                        offsetOption
                    );

                    // Increment diameter, save second guess of tube count into memory
                    D_new = D_old * beta;
                    D_new =
                        tubeFieldOTL(
                            D_new,
                            OTLClearance,
                            tubeOD,
                            pitchRatio,
                            layout,
                            offsetOption
                        )! + OTLClearance;
                    numTubes_new = tubeCount(
                        D_new,
                        OTLClearance,
                        tubeOD,
                        pitchRatio,
                        layout,
                        offsetOption
                    );

                    while (numTubes_new !== minTubes && i < max_i) {
                        // Re-initialise guesses. if there has been a previous attempt, use that as a starting point.
                        if (!D_bestGuess) {
                            D_old = D_new;
                        } else {
                            D_old = D_bestGuess;
                        }

                        if (i > 1) {
                            // Shortcircuit by reducing the diameter by a small amount to see whether the predicted number of tubes goes below the target.
                            // if tube count reduces, then min ID has been found.
                            if (numTubes_new > minTubes) {
                                D_check = roundUp(
                                    tubeFieldOTL(
                                        D_new,
                                        OTLClearance,
                                        tubeOD,
                                        pitchRatio,
                                        layout,
                                        offsetOption
                                    )! + OTLClearance,
                                    8
                                );
                                numTubes_check = tubeCount(
                                    D_check - 0.000001,
                                    OTLClearance,
                                    tubeOD,
                                    pitchRatio,
                                    layout,
                                    offsetOption
                                );
                                if (numTubes_check < minTubes) {
                                    minTubes = numTubes_new;
                                    return D_check;
                                } else if (numTubes_check < numTubes_new) {
                                    D_new = D_check;
                                }
                            }
                        }

                        // if last two guesses result in tubes less than target, increment diameter guess by beta factor.
                        if (numTubes_new < minTubes && numTubes_old < minTubes) {
                            D_new = D_old * beta;
                        }

                        // if the last two guesses result in tubes more than target, decrease diameter by beta factor.
                        else if (numTubes_new > minTubes && numTubes_old > minTubes) {
                            D_new = D_old / beta;

                            // if the last two guesses are both more and less than target,
                            // take the average of the last two guesses as the next guess.
                        } else {
                            D_new = (D_new + D_old) / 2;
                        }

                        numTubes_old = tubeCount(
                            D_old,
                            OTLClearance,
                            tubeOD,
                            pitchRatio,
                            layout,
                            offsetOption
                        );
                        numTubes_new = tubeCount(
                            D_new,
                            OTLClearance,
                            tubeOD,
                            pitchRatio,
                            layout,
                            offsetOption
                        );

                        if (numTubes_new > minTubes) {
                            if (!numTubes_bestGuess) {
                                numTubes_bestGuess = numTubes_new;
                                D_bestGuess = D_new;
                            } else if (numTubes_new < numTubes_bestGuess) {
                                numTubes_bestGuess = numTubes_new;
                                D_bestGuess = D_new;
                            }
                        }

                        i = i + 1;
                    }

                    if (i >= max_i) {
                        throw new Error("Max iterations reached. Retrying with different guesses");
                    }

                    return (
                        roundUp(
                            tubeFieldOTL(
                                D_new,
                                OTLClearance,
                                tubeOD,
                                pitchRatio,
                                layout,
                                offsetOption
                            )! + OTLClearance,
                            8
                        ) + 0.0000000001
                    );
                } else {
                    let numTubes_offsetTrue: number, numTubes_offsetFalse: number;
                    numTubes_offsetTrue = findMinID(
                        minTubes,
                        OTLClearance,
                        tubeOD,
                        pitchRatio,
                        layout,
                        "True"
                    );
                    numTubes_offsetFalse = findMinID(
                        minTubes,
                        OTLClearance,
                        tubeOD,
                        pitchRatio,
                        layout,
                        "False"
                    );

                    if (isNaN(numTubes_offsetTrue)) {
                        return numTubes_offsetFalse;
                    } else if (isNaN(numTubes_offsetFalse)) {
                        return numTubes_offsetTrue;
                    } else if (numTubes_offsetTrue < numTubes_offsetFalse) {
                        return numTubes_offsetTrue;
                    } else {
                        return numTubes_offsetFalse;
                    }
                }
            } else {
                let Pt: number;
                Pt = pitchRatio * tubeOD;
                return Pt / Math.sin(Math.PI / minTubes) + tubeOD + OTLClearance;
            }
        } catch (err) {
            if (retries < maxRetries) {
                retries = retries + 1;
                console.log(`Number of retries: ${retries}`);
                minTubes = minTubes + 1;
            } else {
                throw new Error("Max number of retries reached. Min ID could not be found.");
            }
        }
    }
}