var signField = document.querySelector('#signContainer .bit-container');
var combiField = document.querySelector('#combiField .bit-container');
var expoField = document.querySelector('#expoField .bit-container');
var cc1 = document.querySelector('#ccField1 .bit-container');
var cc2 = document.querySelector('#ccField2 .bit-container');
var cc3 = document.querySelector('#ccField3 .bit-container');
var cc4 = document.querySelector('#ccField4 .bit-container');
var cc5 = document.querySelector('#ccField5 .bit-container');
var bitConstruct = ['<div class="bit" id="bit', '"><div class="bit-button"></div><p class="bit-label">0</p></div>'];
createBits();

function createBits(){
    for (var i = 0; i < 64; i++) {
        if (i == 0) {
            signField.innerHTML += bitConstruct[0] + i + bitConstruct[1];
        } else if (i <= 5) {
            combiField.innerHTML += bitConstruct[0] + i + bitConstruct[1];
        } else if (i <= 13) {
            expoField.innerHTML += bitConstruct[0] + i + bitConstruct[1];
        } else if (i <= 23) {
            cc1.innerHTML += bitConstruct[0] + i + bitConstruct[1];
        } else if (i <= 33) {
            cc2.innerHTML += bitConstruct[0] + i + bitConstruct[1];
        } else if (i <= 43) {
            cc3.innerHTML += bitConstruct[0] + i + bitConstruct[1];
        } else if (i <= 53) {
            cc4.innerHTML += bitConstruct[0] + i + bitConstruct[1];
        } else {
            cc5.innerHTML += bitConstruct[0] + i + bitConstruct[1];
        }
    }
}