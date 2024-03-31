let doc = document;
let headerCounter = doc.querySelector(".header-limit");
let contentCounter = doc.querySelector(".content-limit");

let headerMax = parseInt(headerCounter.innerHTML.trim());
let contentMax = parseInt(contentCounter.innerHTML.trim());;

let reviewButton = doc.querySelector(".review-add-submit");
let addButton = doc.querySelector("#add-review-button");
let delButton = doc.querySelector("#delBtn");
let editButton = doc.querySelector("#editBtn");
let errText = doc.querySelector("#errText");
let anonCheck = doc.querySelector("#anonCheck");

//hide review button if not logged in
if(!doc.querySelector("form[action='/logout']")){
	addButton.style.display="none";
}

//Attach eventlistener to remove the error text in rating
doc.querySelector(".review-input-rating").addEventListener('change', function () {
	errText.style.display="none";
});

//attach eventlisteners to change the character counters
doc.querySelector('.header-textbox').addEventListener('input', function (){
	headerCounter.innerHTML = headerMax - doc.querySelector('.header-textbox').value.length
	if(parseInt(headerCounter.innerHTML) >= 0){
		headerCounter.style.color = "#777777";
	}
	else{
		headerCounter.style.color = "#FF0000";
	}
});

doc.querySelector('.content-textbox').addEventListener('input', function (){
	contentCounter.innerHTML = contentMax - doc.querySelector('.content-textbox').value.length
	if(parseInt(contentCounter.innerHTML) >= 0){
		contentCounter.style.color = "#777777";
	}
	else{
		contentCounter.style.color = "#FF0000";
	}
});

if(editButton != null && delButton != null){ //User already has a review & is logged in
	addButton.innerHTML = "<p>Edit Review</p>"
	
	//editbutton click listener
	editButton.addEventListener('click', setPromptEdit);
	addButton.addEventListener('click', setPromptEdit);
	
	//deletebutton click listener
	delButton.addEventListener('click', setPromptDelete);

}
else{
	addButton.addEventListener('click', toggleReview);
	reviewButton.addEventListener('click', add);
}

function getInputReviewValues() {
	let anon = false;
	let rating = null;
	let ratingInput = doc.querySelector("input[type='radio']:checked"); 
	if (doc.querySelector("#anon:checked") != null){
		anon = true;
	}
	if(ratingInput != null){
		rating = ratingInput.value;
	}
	return {
		id: doc.querySelector('#p_id').value,
		header: doc.querySelector('.header-textbox').value,
		content: doc.querySelector('.content-textbox').value,
		rating: rating,
		anon: anon
	}
}

async function add(){
	let {header, content, id, rating, anon} = getInputReviewValues();
	
	//we should be able to pass a flag for anonymous rating
	
	
	if(!errorCheck({header, content, rating})){
		let data = JSON.stringify({header, content, id, rating, anon});
		let res = await fetch('/addReview', {
			method: "POST",
			body: data,
			headers: {
				"Content-Type": "application/json"
			}
		});
		
		if(res.status == 200){
			alert("Succesfully posted review!");
			location.reload();
		}
		else{
			alert("Error!");
		}	
	}
}

async function edit(){
	let {header, content, id, rating, anon} = getInputReviewValues();
	
	//we should be able to pass a flag for anonymous rating
	
	
	if(!errorCheck({header, content, rating})){
		let data = JSON.stringify({header, content, id, rating, anon});
		let res = await fetch('/editReview', {
			method: "POST",
			body: data,
			headers: {
				"Content-Type": "application/json"
			}
		});
		
		if(res.status == 200){
			alert("Succesfully updated review!");
			location.reload();
		}
		else{
			alert("Error!");
		}
	}
}

async function del(){
	let id = doc.querySelector('#p_id').value;
	let res = await fetch('/delReview', {
		method: "POST",
		body: JSON.stringify({id}),
		headers: {
			"Content-Type": "application/json"
		}
	});
	if(res.status == 200){
		alert("Succesfully deleted your review!");
		location.reload();
	}
	else{
		alert("Error!");
	}
}

async function setPromptDelete(){
	doc.querySelector('.review-add-title').innerHTML = "Are you sure you want to delete your review?";
	doc.querySelector('.review-add-title').style.fontSize = "3vh";
	doc.querySelector('.review-add-submit').style.marginTop = "4vh";
	//If there, remove input areas
	doc.querySelector('.review-input-header').style.display="none";
	doc.querySelector('.review-input-rating').style.display="none";
	doc.querySelector('.review-input-content').style.display="none";
	anonCheck.style.display="none";
	
	reviewButton.innerHTML = "Delete";
	reviewButton.removeEventListener('click', edit);
	reviewButton.addEventListener('click', del);
	
	toggleReview(event);
}

async function setPromptEdit(){
	//if gone, bring back input areas
	doc.querySelector('.review-input-header').style.display="block";
	doc.querySelector('.review-input-rating').style.display="block";
	doc.querySelector('.review-input-content').style.display="block";
	anonCheck.style.display="block";
	
	//Change prompt text
	doc.querySelector('.review-add-title').innerHTML = "Update your review";
	
	//get user rating
	let userRating = parseInt(doc.querySelector("#userReviewRating").value);
	
	//get input areas
	let header = doc.querySelector(".header-textbox");
	let content = doc.querySelector(".content-textbox");
	let ratingQuery = "input[value='" + userRating + "']";
	let rating = doc.querySelector(ratingQuery);
	
	//fill input areas with old data
	let userHeader = doc.querySelector("#userReviewHeader");
	let userContent = doc.querySelector("#userReviewContent");
	if(userHeader != null){
		userHeader = userHeader.innerHTML.trim();
	}
	else{
		userHeader = "";
	}
	
	if(userContent != null){
		userContent = userContent.innerHTML.trim();
	}
	else{
		userContent = "";
	}
	
	header.innerHTML = userHeader;
	content.innerHTML = userContent;
	rating.setAttribute("checked","");
	
	//review button event change
	reviewButton.innerHTML = "Update";
	reviewButton.removeEventListener('click', del); //from delete
	reviewButton.addEventListener('click', edit);
	
	toggleReview(event);
}

function showError(e){
	errText.innerHTML=e;
	errText.style.display="block";
}

function errorCheck(data){
	let {header, content, rating} = data;
	console.log(header);
	console.log(content);
	console.log(rating);
	if(data.rating == null){
		showError("Rating cannot be empty! Please rate the product.");
		return true;
	}
	else if(data.header == "" && data.content != ""){
		showError("Cannot have empty header when review body is not empty! Consider putting your review in the header instead.");
		return true;
	}
	else if(parseInt(headerCounter.innerHTML) < 0){
		showError("Header is too long!");
		return true;
	}
	else if(parseInt(contentCounter.innerHTML) < 0){
		showError("Review content is too long!");
		return true;
	}
	return false;
}
