const refundButton = document.querySelectorAll('#refundButton');
const orderID = document.querySelector('#orderID').textContent;

refundButton.forEach(button => { button.addEventListener('click', async (e) => {
    e.preventDefault();

    const index = button.getAttribute('data-orderIndex');
    const productID = button.getAttribute('data-ID');
    console.log(productID);
    console.log(index);
    console.log(orderID);
    console.log('refund button clicked');

    const jString = JSON.stringify({orderID,index, productID});

    const response = await fetch('/initiateRefund', {
        method: "POST",
        body: jString,
        headers: {
            "Content-Type": "application/json"
        }
    })

    if(response.status == 200){
        window.location.href = '/getRefund';
    }else{
        console.log("error has occured");
    }


})
})