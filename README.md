# IEEE-754 Decimal-64 Converter

## Overview 
- This repository contains a Decimal to IEEE-754 Decimal-64 floating-point converter, developed as a course requirement for CSARCH2 (Computer Architecture) at De La Salle University - Manila. The converter is designed to handle large numbers with more than 16 digits, supporting special cases like *NaN*. It outputs results in binary and hexadecimal forms, with an option to save the results to a text file.

## Features
- **Input**: Accepts decimal numbers in base-10 format, supporting more than 16 digits. Users can choose their preferred rounding method.
- **Special Cases**: Handles special cases such as *NaN* seamlessly.
- **Output Formats**: 
    1. Binary output with space between sections.
    2. Hexadecimal equivalent.
    3. Option to output results to a text file.

## Usage
### Online 
- accessible at this link: https://kylecarlo.github.io/IEEE-Dec64-Converter/
### Local
- download the repository (zip)
- extract the zip file
- run a server
    - if using VScode, install the extension **Live Server** *(by Ritwick Dey)*
    - open the directory where the *index.html* is located
    - run the server

## Test Cases
### Normal Cases
![normal case](tests/normal_case.png)
#### with different rounding algorithms
- truncate positive input
    ![truncate positive](tests/positive_trun.png)
- truncate negative input
    ![truncate negative](tests/negative_trun.png)
- ceil positive input
    ![ceil positive](tests/positive_ceil.png)
- ceil negative input
    ![ceil negative](tests/negative_ceil.png)
- floor positive input
    ![floor positive](tests/positive_floor.png)
- floor negative input
    ![floor negative](tests/negative_floor.png)
- round to nearest, ties to even of positive input
    ![rtnte positive](tests/positive_even.png)
- round to nearest, ties to even of negative input
    ![rtnte negative](tests/negative_even.png)
### Special Cases
#### Infinity
- Positive Infinity (exponent too large; ***e > 369***)
    ![positive infinity case](tests/inf_case.png)
- Negative Infinity (exponent too small; ***e < -398***)
    ![negative infinity case](tests/neg_inf_case.png)
#### Not A Number (***NaN***)
![NaN case](tests/nan_case.png)

## Demo
If the video is not playing, click this <a href="https://youtu.be/3LneY9X8juU">link</a> or check the video ***demo.mp4*** uploaded in this repository.


https://github.com/KyleCarlo/IEEE-Dec64-Converter/assets/90784458/237c3010-54a0-4235-aad3-66e192fbd2b8


## Analysis
### System Design
- The entire project used ***HTML, CSS, and JS***.
- The web application applied ***MVC (model-view-controller) application architecture***. The model and view components can be seen in the ***view/*** directory. The controller component can be seen in the ***control/*** directory.
- The following pseudocode is applied to the web application to simulate the conversion of decimal into IEEE 754 Decimal-64 floating point format
    1. Takes the input mantissa, exponent, and rounding mode as a string.
    2. Check if the mantissa and exponent is a valid number. If either mantissa or exponent is invalid, set the state to ***NaN*** and then skip to step 6. Else, proceed to step 3.
    3. Normalize into IEEE Decimal-64 Normalized Format (16 whole decimal digits).
    4. If the normalized form has fractional part, round off the normalized form according to rounding mode.
    5. Check the exponent. 
        - If the exponent is greater than ***369 (Max Normalized)***, then set the state to ***Infinity***. 
        - Else if the exponent is less than ***-383 (Min Normalized)***, then set the state to ***Zero*** and set the number to *0x10^0*.
    6. Check the state. 
        - If the state is ***NaN***, set the ***combination field (CF)*** to all **11111** and set the ***sign bit (S)*** to **0**. Set the ***exponent continuation (EC)*** and ***coefficient continuation (CC)*** to **0** and stop already. 
        - Else if the state is ***Infinity***, then set the ***combination field (CF)*** to **11110** and set the ***sign bit (S)*** to **1** if the sign of mantissa is negative or set to **0** if the sign of mantissa is positive. Set the ***exponent continuation (EC)*** and ***coefficient continuation (CC)*** to **0** and stop already. 
        - Else if the state is ***Normal*** or ***Zero***, proceed to step 7.
    7. Make the ***sign bit (S)*** to **0** if the mantissa is positive or set it to **1** if the mantissa is negative.
    8. The ***combination field (CF)*** depends on the ***most significant digit of mantissa (MSd)***. (Note that 0th bit is least significant bit of CF and 4th bit is the most significant bit of CF).
        - If ***MSd*** is a major number ***(8 or 9)***, then the 4th and 3rd bits are set to **11**, the 2nd and 1st bits are set to the 9th and 8th bits of ***normalized binary exponent (e')*** respectively and the 0th bit is set to the least significant bit of binary ***(MSd)***.
        - Else if ***MSd*** is a minor number ***(0 to 7)***, the 4th and 3rd bits are set to the 9th and 8th bits of ***normalized binary exponent (e')*** respectively and the 2nd, 1st, 0th bits are set to the 2nd, 1st, 0th bits of binary ***(MSd)***.
    9. The ***exponent continuation field (EC)*** are set to 7th to 0th bits of ***normalized binary exponent (e')***.
    10. The ***coefficient continuation*** will contain the densley packed BCD (Binary Coded Decimal) of the remaining whole decimal digits.
### Problems Encountered
#### Limitations of Javascript
- **Challenge**: math error
- **Solution**: converted BigInt
#### Catching the Special Cases
- **Challenge**: hard to catch, found out while debugging
- **Solution**: bunch of if else
#### Switching between String and Number Data Type
- **Challenge**: input as a string but needs to convert to number data type
- **Solution**: carefully handled the conversion between string and number

## Authors
- Sealtiel Dy (sealtiel_dy@dlsu.edu.ph)
- Robert Joachim Encinas (robert_joachim_encinas@dlsu.edu.ph)
- Daphne Janelyn Go (daphne_janelyn_go@dlsu.edu.ph)
- Kyle Carlo Lasala (kyle_lasala@dlsu.edu.ph)
- Maria Monica Manlises (maria_monica_manlises@dlsu.edu.ph)
