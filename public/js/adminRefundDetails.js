const refundCustomer = document.querySelector('#refund');

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
        //window.location.href = '/refundCustomer';
    }else{
        console.log("error has occured");
    }


})