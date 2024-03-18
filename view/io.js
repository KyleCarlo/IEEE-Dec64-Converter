import { convert } from '../control/functions.js';
// input
var inputDecimal = document.getElementById('decimal');
var inputExponent = document.getElementById('exponent');
var inputRoundMode = document.getElementById('rounding');
// output
var normContainer = document.querySelector('.normContainer .outputString p');
var eContainer = document.querySelector('.ePrime .outputString p');
var ebinContainer = document.querySelector('.ePrimeBin .outputString p');
var msdContainer = document.querySelector('.msContainer .outputString p');
var msdbinContainer = document.querySelector('.msbinContainer .outputString p');
var cc1 = document.querySelector('.cc1 .outputString p');
var cc2 = document.querySelector('.cc2 .outputString p');
var cc3 = document.querySelector('.cc3 .outputString p');
var cc4 = document.querySelector('.cc4 .outputString p');
var cc5 = document.querySelector('.cc5 .outputString p');
var ieeeContainer = document.querySelector('.hexContainer .outputString p');
var submitButton = document.querySelector('.inputDecimal .submitButton');
var bitContainers = document.querySelectorAll('.bit');

listenToInput();

function listenToInput() {
    submitButton.addEventListener('click', function() {
        console.log(inputDecimal.value, inputExponent.value, inputRoundMode.value);
        var result = convert(inputDecimal.value, inputExponent.value, inputRoundMode.value);
        resetState();
        updateState(result);
    });
}

function resetState() {
    normContainer.innerHTML = '';
    eContainer.innerHTML = '';
    ebinContainer.innerHTML = '';
    msdContainer.innerHTML = '';
    msdbinContainer.innerHTML = '';
    cc1.innerHTML = '';
    cc2.innerHTML = '';
    cc3.innerHTML = '';
    cc4.innerHTML = '';
    cc5.innerHTML = '';
    ieeeContainer.innerHTML = '';
    for (let index = 0; index < bitContainers.length; index++) {
        bitContainers[index].childNodes[1].innerHTML = '0';
        bitContainers[index].childNodes[0].style.backgroundColor = 'revert-layer';
        console.log(bitContainers[index].childNodes[1])
    }
}

function updateState(result) {
    // NaN case
    if (result.type == 'NaN' || result.type == 'Zero'){
        normContainer.innerHTML = result.normalizedForm;
    }
    // Infinity case
    else if (result.type == 'Infinity'){
        normContainer.innerHTML = 'inf';
    } 
    // Normal case
    else if (result.type == 'Normal'){
        normContainer.innerHTML = result.normalizedForm;
        
        eContainer.innerHTML = result.ePrime;
        ebinContainer.innerHTML = "";
        
        cc1.innerHTML = result.coefficients[0];
        cc2.innerHTML = result.coefficients[1];
        cc3.innerHTML = result.coefficients[2];
        cc4.innerHTML = result.coefficients[3];
        cc5.innerHTML = result.coefficients[4];
        msdContainer.innerHTML = result.MSd;
        msdbinContainer.innerHTML = "";
        
        // design ePrimeBin
        for (let index = 0; index < result.ePrimeBin.length; index++) {
            if (index == 0 || index == 1){
                ebinContainer.innerHTML += '<span style="color: rgb(255, 93, 93)">' + result.ePrimeBin[index] + '</span>';
            } else {
                ebinContainer.innerHTML += '<span style="color: #3147c4">' + result.ePrimeBin[index] + '</span>';
            }
        }
        // design ec
        for (let index = 0; index < 8; index++) {
            bitContainers[index + 6].childNodes[1].style.fontWeight = 'bolder';
            bitContainers[index + 6].childNodes[1].style.color = '#3147c4';
        }
        if (result.MSdBin[0] == '0'){
            // design output bits
            for (let index = 0; index < 5; index++) {
                bitContainers[index + 1].childNodes[1].style.fontWeight = 'bolder';
                if (index == 0 || index == 1){
                    bitContainers[index + 1].childNodes[1].style.color = 'rgb(255, 93, 93)';
                } else {
                    bitContainers[index + 1].childNodes[1].style.color = 'rgb(255, 255, 93)';
                }
            }
            // design msd
            for (let index = 0; index < result.MSdBin.length; index++) {
                if (index > 0){
                    msdbinContainer.innerHTML += '<span style="color: rgb(255, 255, 93)">' + result.MSdBin[index] + '</span>';
                } else {
                    msdbinContainer.innerHTML += '<span>' + result.MSdBin[index] + '</span>';
                }
            }
        }
        else if (result.MSdBin[0] == '1'){
            // design output bits
            for (let index = 0; index < 5; index++) {
                bitContainers[index + 1].childNodes[1].style.fontWeight = 'bolder';
                if (index <= 1){
                    bitContainers[index + 1].childNodes[1].style.color = '#A8BEC9';
                } else if (index <= 3) {
                    bitContainers[index + 1].childNodes[1].style.color = 'rgb(255, 93, 93)';
                } else {
                    bitContainers[index + 1].childNodes[1].style.color = 'rgb(255, 255, 93)';
                }
            }
            // design msd
            for (let index = 0; index < result.MSdBin.length; index++) {
                if (index == result.MSdBin.length - 1){
                    msdbinContainer.innerHTML += '<span style="color: rgb(255, 255, 93)">' + result.MSdBin[index] + '</span>';
                } else {
                    msdbinContainer.innerHTML += '<span>' + result.MSdBin[index] + '</span>';
                }
            }
        }
        ieeeContainer.innerHTML = result.ieeeHex;
    } 
    ieeeContainer.innerHTML = result.ieeeHex;
    var binary = result.ieeeBin;
    for (let index = 0; index < binary.length; index++) {
        setBit(bitContainers[index], binary[index]);
    }
}

function setBit(bitContainer, bitState) {
    var label = bitContainer.querySelector('.bit-label');
    var bitButton = bitContainer.querySelector('.bit-button');
    if (bitState != label.innerHTML)
        if (label.innerHTML == '0') {
            label.innerHTML = '1';
            bitButton.style.backgroundColor = '#31C4BE';
        } else {
            label.innerHTML = '0';
            bitButton.style.backgroundColor = 'revert-layer';
        }
}