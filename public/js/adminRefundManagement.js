const refundInstances = document.querySelectorAll('#refundInstance');

refundInstances.forEach(button => { button.addEventListener('click', async (e) => {
    e.preventDefault();

    const refundID = button.dataset.index;
    console.log(refundID);

    const jString = JSON.stringify({refundID});

    const response = await fetch('/getAdminRefundDetails/' + refundID, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })

    if(response.status == 200){
        window.location.href = '/getAdminRefundDetails/' + refundID;
    }else{
        console.log("error has occured");
    }


})
})