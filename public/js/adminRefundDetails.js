const refundCustomer = document.querySelector('#refund');
const deny = document.querySelector('#deny');
const reasonDiv = document.querySelector('#reasonDiv');
const options = document.querySelector('#options');
const cancel = document.querySelector('#cancel');
const reason = document.querySelector('#reason');
const submitDeny = document.querySelector('#submitDeny');

reasonDiv.style.visibility = "hidden";
submitDeny.disabled = true;

refundCustomer.addEventListener('click', async (e) => {
    console.log("clicked");

    e.preventDefault();

    const paymentID = refundCustomer.getAttribute('data-paymentID');
    const refundID = refundCustomer.getAttribute('data-refundID');

    console.log(paymentID);
    console.log(refundID);

    const jString = JSON.stringify({paymentID, refundID});

    const response = await fetch('/refundCustomer', {
        method: "POST",
        body: jString,
        headers: {
            "Content-Type": "application/json"
        }
    })

    if(response.status == 200){
        location.reload(true);
    }else{
        console.log("error has occured");
    }


});

deny.addEventListener('click', async (e) => {  
    reasonDiv.style.visibility = "visible";
    options.style.visibility = "hidden";
})

cancel.addEventListener('click', async (e) => {  
    reasonDiv.style.visibility = "hidden";
    options.style.visibility = "visible";
})

reason.addEventListener('input', async (e) => {  
    if(reason.value.trim() == ''){
        submitDeny.disabled = true;
        submitDeny.textContent = "Please fill out reason first";
    }else{
        submitDeny.disabled = false;
        submitDeny.textContent = "Deny Refund";
    }
})

submitDeny.addEventListener('click', async (e) => {
    console.log("clicked");

    e.preventDefault();

    const reasonString = reason.value;
    const refundID = submitDeny.getAttribute('data-refundID');

    console.log(reasonString);
    console.log(refundID);

    const jString = JSON.stringify({reasonString, refundID});

    //console.log(jString)

    const response = await fetch('/denyRefund', {
        method: "POST",
        body: jString,
        headers: {
            "Content-Type": "application/json"
        }
    })

    if(response.status == 200){
        location.reload(true);
    }else{
        console.log("error has occured");
    }


});