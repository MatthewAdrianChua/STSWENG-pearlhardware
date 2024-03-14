const form = document.querySelector('form');
const upload = document.querySelector('#upload');
const feedback = document.querySelector('#feedback');
const files = document.querySelector('#files');

let images = [];

/*
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    
    // Access input fields
    const reason = document.getElementById('reason').value;
    const comments = document.getElementById('comments').value;

    const formData = new FormData();
    formData.append('reason', reason);
    formData.append('comments', comments);

    // Append each image file to the FormData object
    images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
    });

    const response = await fetch('/createRefund', {
        method: "POST",
        body: formData
    });

    if(response.status == 200){
        console.log("success");
    }else{
        console.log("error has occurred");
    }
});

upload.addEventListener('click', (e) => {
    e.preventDefault();

    images.push(document.querySelector('input[type="file"]').files[0]);

    feedback.textContent = "Image Uploaded";
    feedback.style.color = "green";

    files.setAttribute('style', 'white-space: pre;');
    files.textContent += document.querySelector('input[type="file"]').files[0].name + ' \r\n';

    console.log(images);
});
*/

  
