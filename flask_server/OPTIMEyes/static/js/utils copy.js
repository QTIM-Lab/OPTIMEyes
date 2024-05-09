// source: https://gist.github.com/paldepind/7211654

var HOST = "localhost"
var PORT = "5984"
var DB = "image_comparator"
var DB_USER = "admin"
var DB_PASS = "password"
var ADMIN_PARTY = false

// let VIEW = "imageSet2ImageId"

async function delete_docs_in_view(design_doc, view) {
    var url_getViewDocs = `http://${HOST}:${PORT}/${DB}/_design/${design_doc}/_view/${view}`
    var url_delete_doc = `http://${HOST}:${PORT}/${DB}`

    // fetch
    response = await fetch(url_getViewDocs, {
        method: 'GET',
        headers: { 'Authorization': 'Basic ' + btoa(`${DB_USER}:${DB_PASS}`) }
    })
    data = await response.json();
    data.rows.forEach(async function (doc) {
        response_delete = await fetch(url_delete_doc + `/${doc.id}?rev=${doc.value._rev}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Basic ' + btoa(`${DB_USER}:${DB_PASS}`) }
        })
        data_delete = await response_delete.json();
        console.log("Deleted document with id " + data_delete.id);
    });

}

// delete_docs_in_view(VIEW)

// Dangerous!!!
// views_to_clear = ['users', 'taskresults', 'tasks', 'classifyResults', 'image_classify_lists', 'image_compare_lists', 'image_grid_lists', 'imageSet2ImageId_deleteme']
// views_to_clear = ['imagesByList']
views_to_clear = ['deleteME']

views_to_clear.forEach((v, i, a) => {
    delete_docs_in_view(design_doc = 'monaiSegmentationApp', view = v) //delete al docs in this view
})


// Get Doc
//let DOC_ID = "9218b9c59ce6a2194bd03091e7005c92"
//let DOC_URL = `http://${HOST}:${PORT}/${DB}/${DOC_ID}`
//$.ajax({
//    url: DOC_URL,
//    type: "GET",
//    success: function (data) {
//        console.log(data)
//    }
//})