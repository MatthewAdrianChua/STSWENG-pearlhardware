const registerSubmit = document.querySelector('#submit');
const regFName = document.querySelector('#regfname');
const regLName = document.querySelector('#reglname');
const regEmail = document.querySelector('#regemail');
const regPassword = document.querySelector('#regpassword');
const regLine1 = document.querySelector('#regline1');
const regLine2 = document.querySelector('#regline2');
const regCity = document.querySelector('#regcity');
const regState = document.querySelector('#regstate');
const regPostalCode = document.querySelector('#regpostalcode');
const errorDisplay = document.querySelector("#errors");
const pid = document.querySelector("#id");
const amount = document.querySelector("#amount");
const title = document.querySelector('#title');

function checkInputs() { //this function disables the register submit button until all fields have values
    if(regFName.value.trim() !== '' && regLName.value.trim() !== '' && regEmail.value.trim() !== '' && regLine1.value.trim() !== '' && regCity.value.trim() !== '' && regState.value.trim() !== '' && regPostalCode.value.trim() !== ''){
        registerSubmit.disabled = false;
        registerSubmit.textContent = "Submit";
        registerSubmit.style.color = "black";
    }else{
        registerSubmit.disabled = true;
        registerSubmit.textContent = "Fill out all inputs!";
        registerSubmit.style.color = "red";
    }
}

checkInputs();

regFName.addEventListener('input', checkInputs); //everytime the user inputs a field it checks if all the fields are filled out
regLName.addEventListener('input', checkInputs)
regLine1.addEventListener('input', checkInputs);
regCity.addEventListener('input', checkInputs);
regState.addEventListener('input', checkInputs);
regPostalCode.addEventListener('input', checkInputs);

title.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log("title clickled")
    window.location.href = '/';
})

registerSubmit.addEventListener('click', async (e) =>{
    e.preventDefault();

    const fname = regFName.value;
    const lname = regLName.value;
    const email = regEmail.value;
    const line1 = regLine1.value;
    const line2 = regLine2.value;
    const state = regState.value;
    const city = regCity.value;
    const postalCode = regPostalCode.value;

    const jString = JSON.stringify({fname,lname, email, line1, line2, state, city, postalCode});

    const response = await fetch('/initializeGuest', {
        method: "POST",
        body: jString,
        headers: {
            "Content-Type": "application/json"
        }
    })

    if(response.status == 200){

        console.log("OKAY")
        const quant = amount.dataset.index;
	    const id = pid.dataset.index;

	    const jString = JSON.stringify({quant, id});

        const response2 = await fetch('/buyNow', {
            method: "POST",
            body: jString,
            headers: {
                "Content-Type": "application/json"
            }
        });

        if(response2.status == 200){
            console.log("RESPONSE2CHECK")
            const checkout_url = await response2.text();
            console.log(checkout_url);
            window.location.href = checkout_url
            submit.textContent = "Checkout"
        }else if(response2.status == 404){
            console.log("404")
        }
    }else if(response.status == 406){ //displays invalid email format message
        console.log("OKAY")
        console.error(`An error has occurred, Status code = ${response.status}`);
        errorDisplay.textContent = "Invalid email format!";
        errorDisplay.style.color = "red";
    }else if(response.status == 410){ //displays invalid email format message
        console.log("OKAY")
        console.error(`An error has occurred, Status code = ${response.status}`);
        errorDisplay.textContent = "Postal code up to 4 digits only!";
        errorDisplay.style.color = "red";
    }
})