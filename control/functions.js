/* Constants */
const digits = 16
const eMaxNormalized = 369
const eMaxDenormalized = 384
const eMinNormalized = -383
const eMinDenormalized = -398
const bias = 398
const eLimit = 767

const BCDMap = {
    "000": "bcdfgh0jkm",
    "001": "bcdfgh100m",
    "010": "bcdjkh101m",
    "011": "bcd10h111m",
    "100": "jkdfgh110m",
    "101": "fgd01h111m",
    "110": "jkd00h111m",
    "111": "00d11h111m"
}

const indexMap = {
    "b": 1,
    "c": 2,
    "d": 3,
    "f": 5,
    "g": 6,
    "h": 7,
    "j": 9,
    "k": 10,
    "m": 11,
}

const systemState = {
    normalizedForm: "",
    ePrime: "",
    ePrimeBin: "",
    coefficients: [],
    coefficientsBCD: [],
    MSd: "",
    MSdBin: "",
    ieeeHex: "",
    ieeeBin: "",
    type: ""
}

/* Utility Functions */
const stringParser = (rawInput) => {
    rawInput.replace(",", "")
    if(isNaN(rawInput)) {
        return NaN
    } else {
        return rawInput 
    }
}

const preprocess = (number, exponent, roundMode) => {
    systemState.type = "Normal"
    if(number == "" || exponent == "" || isNaN(number) || isNaN(exponent)) {
        var value = "NAN"
        systemState.type = "NaN"
        systemState.normalizedForm = "NaN"
    } else {
        var temp = normalize(number, exponent, roundMode)
        var value = temp.value
        exponent = temp.exponent
        var overflowSignal = temp.overflowSignal

        // Check for special cases
        const eNumeric = BigInt(exponent)
        if(eNumeric > eMaxNormalized || overflowSignal === true) {
            systemState.type = "Infinity"
            systemState.normalizedForm = "Number Too Large"
        } else if(eNumeric < eMinDenormalized || parseFloat(value) === 0) {
            value = "0"
            exponent = "0"
            systemState.type = "Zero"
        }

        if(value[0] === "-") {
            value = "-" + value.slice(1).padStart(digits, "0")
        } else {
            value = value.padStart(digits, "0")
        }
        
        systemState.normalizedForm = `${value.padStart(16, "0")} x 10^${exponent}` 
    }

    return { value, exponent }
}

const splitNumber = (number) => {
    const split = number.split(".")

    var i
    for(i = 0; i < split[0].length; i++) {
        if(split[0][i] !== "0") {
            break;
        }
    }

    if(split.length === 1) {
        if(split[0].slice(i).length === 0) {
            return { whole: "0", decimal: "0" }
        }

        return { whole: split[0].slice(i), decimal: "0" }
    } else {
        var j
        for(j = split[1].length - 1; j >= 0; j--) {
            if(split[1][j] !== "0") {
                break;
            }
        }
        if(split[0].slice(i).length === 0) {
            return { whole: "0", decimal: split[1].slice(0, j + 1) }
        } 

        return { whole: split[0].slice(i), decimal: split[1].slice(0, j + 1) }
    }
}

const normalize = (number, exponent, roundMode) => {    
    var { whole, decimal } = splitNumber(number)
    var negativeFactor = 0
    if(BigInt(whole) < BigInt(0)) {
        negativeFactor = 1
    }
    var wholeLength = whole.length
    exponent = BigInt(exponent)
    
    while(wholeLength - negativeFactor !== digits) {
        if((decimal.length === 0 || BigInt(decimal) === BigInt(0)) && wholeLength - negativeFactor < digits) {
            break
        }

        if(wholeLength - negativeFactor < digits) {
            ({ whole, decimal } = shiftRightString(whole, decimal))
            exponent--
        } else {
            ({ whole, decimal } = shiftLeftString(whole, decimal))
            exponent++
        }
        wholeLength = whole.length
    }

    //Denormalize if needed
    if(exponent > eMaxNormalized && exponent <= eMaxDenormalized) {
        var change = 0
        while(exponent > eMaxNormalized) {
            if(whole.length - negativeFactor === digits) {
                break
            }

            if(decimal.length === 0) {
                decimal = "0"
            }

            ({ whole, decimal } = shiftRightString(whole, decimal))
            exponent--
        }
    }

    if(decimal.length === 0) {
        decimal = "0"
    }

    exponent = exponent.toString()
    const { value, overflowSignal } = round(whole, decimal, roundMode)
    return {value, exponent, overflowSignal}
}

const shiftRightString = (whole, decimal) => {
    whole += decimal[0]
    decimal = decimal.slice(1)
    
    return { whole, decimal }
}

const shiftLeftString = (whole, decimal) => {
    decimal = whole[whole.length - 1] + decimal
    whole = whole.slice(0, whole.length - 1)
    
    return { whole, decimal }
} 

const round = (whole, decimal, roundMode) => {
    switch(roundMode) {
        case "trun":
            return { value: whole, overflowSignal: false}
        case "ceil":
            if(BigInt(decimal) !== 0 && BigInt(whole) > 0) {
                var temp = BigInt(whole) + BigInt(1)
                var negativeFactor = (temp < 0) ? 1 : 0
                temp = temp.toString()
                if(temp.length - negativeFactor > digits) {
                    if(negativeFactor === 1) {
                        return { value: whole, overflowSignal: true}
                    } else {
                        return { value: whole, overflowSignal: true}
                    }
                }

                return { value: temp.toString(), overflowSignal: false}
            } else {
                return { value: whole, overflowSignal: false}
            }
        case "floor":
            if(BigInt(decimal) !== 0 && BigInt(whole) < 0) {
                var temp = BigInt(whole) + BigInt(1)
                var negativeFactor = (temp < 0) ? 1 : 0
                temp = temp.toString()
                if(temp.length - negativeFactor > digits) {
                    if(negativeFactor === 1) {
                        return { value: whole, overflowSignal: true}
                    } else {
                        return { value: whole, overflowSignal: true}
                    }
                }

                return { value: temp.toString(), overflowSignal: false}
            } else {
                return { value: whole, overflowSignal: false}
            }
        case "even":
            const tieLine = BigInt(5 * Math.pow(10, decimal.length - 1))
            const numericDec = BigInt(decimal)
            const isTie = numericDec === tieLine
            if(isTie) {
                const isEven = (BigInt(whole) % BigInt(2) === BigInt(0))

                if(isEven) {
                    return { value: whole, overflowSignal: false}
                } else {
                    if(BigInt(whole) > 0) {
                        var temp = BigInt(whole) + BigInt(1)
                        var negativeFactor = (temp < 0) ? 1 : 0
                        temp = temp.toString()
                        if(temp.length - negativeFactor > digits) {
                            if(negativeFactor === 1) {
                                return { value: whole, overflowSignal: true}
                            } else {
                                return { value: whole, overflowSignal: true}
                            }
                        }

                        return { value: temp.toString(), overflowSignal: false}
                    } else {
                        var temp = BigInt(whole) - BigInt(1)
                        var negativeFactor = (temp < 0) ? 1 : 0
                        temp = temp.toString()
                        if(temp.length - negativeFactor > digits) {
                            if(negativeFactor === 1) {
                                return { value: whole, overflowSignal: true}
                            } else {
                                return { value: whole, overflowSignal: true}
                            }
                        }

                        return { value: temp.toString(), overflowSignal: false}
                    }
                }
            } else {
                const sign = (whole[0] === "-") ? -1 : 1

                if(BigInt(decimal) > tieLine) {
                    return { value: (BigInt(whole) + BigInt(1) * BigInt(sign)).toString(), overflowSignal: false}
                } else {
                    return { value: whole, overflowSignal: false}
                }
            }
    }
}

const toDec64 = (value, exponent, code) => {
    toBinary(value, exponent, code)

    systemState.ieeeHex = ""
    var count = 0
    for(var i = 0; i < 64; i += 4) {
        count++
        systemState.ieeeHex += parseInt(systemState.ieeeBin.slice(i, i + 4), 2).toString(digits).toUpperCase()
        if(count % 4 === 0) {
            systemState.ieeeHex += " "
        }
    }
    systemState.ieeeHex = systemState.ieeeHex.trimEnd()
}

const toBinary = (value, exponent, code) => {
    systemState.ieeeBin = ""
    var negativeFactor = 0
    if(BigInt(exponent) < eMinDenormalized) {
        systemState.ePrime = bias.toString()
        systemState.ePrimeBin = bias.toString(2).padStart(10, "0")
    } else if(BigInt(exponent) > eMaxDenormalized) {
        systemState.ePrime = (BigInt(exponent) + BigInt(bias))
        systemState.ePrimeBin = "Exponent Too Large"
    } else {
        systemState.ePrime = (BigInt(exponent) + BigInt(bias))
        systemState.ePrimeBin = systemState.ePrime.toString(2).padStart(10, "0")
    }

    //Sign
    if(value[0] === "-") {
        systemState.ieeeBin += "1"
        systemState.MSd = value[1]
        negativeFactor = 1
    } else {
        systemState.ieeeBin += "0"
        systemState.MSd = value[0]
    }
    systemState.MSdBin = BigInt(systemState.MSd).toString(2).padStart(4, "0")

    switch(code) {
        case "Zero":
        case "Normal":
            //Combination Field
            if(BigInt(systemState.MSd) > 7) {
                systemState.ieeeBin += "11"
                systemState.ieeeBin += systemState.ePrimeBin.slice(0, 2)
                systemState.ieeeBin += (BigInt(systemState.MSd).toString(2)[3])
            } else {
                systemState.ieeeBin += systemState.ePrimeBin.slice(0, 2)
                systemState.ieeeBin += (BigInt(systemState.MSd).toString(2)).padStart(3, "0")
            }
            //Exponent Continuation
            systemState.ieeeBin += systemState.ePrimeBin.slice(2)

            //Coefficients
            systemState.coefficients = getCoefficients(value.slice(1 + negativeFactor))
            systemState.coefficientsBCD = []
            var handler = ""
            for(const coefficient of systemState.coefficients) {
                handler = toBCD(coefficient)
                systemState.coefficientsBCD.push(handler)
                systemState.ieeeBin += handler
            }
            break
        case "Infinity":
            //Combination Field
            systemState.ieeeBin += "11110"
            //Exponent
            systemState.ieeeBin += "00000000"
            //Coefficient
            systemState.ieeeBin += "00000000000000000000000000000000000000000000000000"
            break
        case "NaN":
            //Combination Field
            systemState.ieeeBin += "11111"
            //Exponent
            systemState.ieeeBin += "00000000"
            //Coefficient
            systemState.ieeeBin += "00000000000000000000000000000000000000000000000000"
            break
    }
}

const getCoefficients = (string) => {
    var coeffs = []

    for(var i = 0; i < 15; i += 3) {
        coeffs.push(string.slice(i, i + 3))
    }

    return coeffs
}

const toBCD = (numString) => {
    var digitString = ""
    for(const digit of numString) {
        digitString += BigInt(digit).toString(2).padStart(4, "0")
    }

    const encoding = BCDMap[digitString[0] + digitString[4] + digitString[8]]

    var BCD = ""
    for(const char of encoding) {
        if(char !== "0" && char !== "1") {
            BCD += digitString[indexMap[char]] 
        } else {
            BCD += char
        }
    }

    return BCD
}

const convert = (number, exp, roundMode) => {
    const {value, exponent } = preprocess(number, exp, roundMode)
    toDec64(value, exponent, systemState.type)
    return systemState
}

export { convert }
