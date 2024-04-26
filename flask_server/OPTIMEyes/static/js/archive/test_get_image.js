

// *FLASK* //
function get_image_from_flask() {

  var url1 = "http://pop-os:8080/get_image/1"
  fetch(url1)
    .then(response => {
      return response.text();
    })
    .then(data => {
      // debugger
      $("#image-from-flask").attr("src", 'data:image/png;base64,' + data)
      // document.getElementById('image-from-flask').src = 'data:image/png;base64,' + data;
      
    })
  
}

get_image_from_flask();



// *COUCHDB* //

var url1 = "http://pop-os:5984/image_comparator/1/image"

function get_url1_js(){
  
  fetch(url1)
    .then(response => {
      debugger
      // response.json();
    })

}

// get_url1_js();



// more complex and complete
function get_url1_complete_js() {
 
  fetch(url1, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    // body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
   .then(response => {
     debugger
     response;
     ;
   })

}

// get_url1_complete_js();