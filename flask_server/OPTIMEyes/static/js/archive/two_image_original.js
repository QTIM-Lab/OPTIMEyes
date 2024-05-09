$(document).ready(function() {
    // THIS WHOLE SECTION MAKES ME CRINGE...DUCT TAPED TOGETHER BARELY

    // Until the code is written better a delay helps force no errors on loading
    setTimeout(()=>{ handleUrlFilter(document.location.search) }, 1000);

    // $.when( config_initialization ).then(() => {
    //     // updateStatusInfo();
    //     init_app()
    //     if (ImageCompare.username) {
    //         ImageCompare.TaskFeeder.SetImagePair(ImageCompare.username);
    //     }
    // })
    // Original below
    // setTimeout(()=>{init_app()}, 1000);
    init_app()

    if (ImageCompare.username) {
        ImageCompare.TaskFeeder.SetImagePair(ImageCompare.username);
    }
});

init_app = function(){
    // FLASK AJAX
    url = `http://${DNS}:${HTTP_PORT}/get_users`
    // COUCHDB AJAX
    // url = `http://${DNS}:${DB_PORT}/${IMAGES_DB}/_design/basic_views/_view/users`
    $.ajax({
        url : url,
        type : 'GET',
        success : function (json) {
            // debugger
            // populate the select dropdown
            users = json.rows
            users.forEach((v,i,a)=>{  
                user = json.rows[i].value.username
                select_dropdown = $("#username")
                select_dropdown.append(`<option value="${user}">${user}</option>`);
                
            })
            
            
        },
        error: function (response) {
            debugger
            console.log("users get failed : " + JSON.stringify(response));
        }
    }); 
 
}

//
handleUrlFilter = function(urlSearchStr) {
    console.log('In handleUrlFilter:\n')
    //alert(urlSearchStr);
    qs= new QueryString(urlSearchStr);
    var user = qs.value("username");
    if (user) {

      ImageCompare.username = user;
      $("#current_user")[0].innerHTML = user
      $("#current_user")[0].style.color = "green"

      OnSetUser(user);
    }

    // if urlSearchStr is not empty, remove the dropdown (db and user options)
    if (urlSearchStr) {
        var elem;
        elem = document.getElementById("database");
        elem.style.display='none'; // or ... style.visibility="hidden"; vis takes the same space, but is not shown
        elem = document.getElementById("username");
        // elem.style.display='none';

        // also remove the Status info about the db
        elem = document.getElementById("si_database");
        elem.style.display='none';
    }
}


// labels can be either primary or danger
// just for controlling the color through bootstrap
setLabelDanger = function(isDanger, label) {
console.log('In setLabelDanger:\n')

    if (isDanger) {
        label.removeClass("label-primary");
        label.addClass("label-danger");
    } else {
        label.removeClass("label-danger");
        label.addClass("label-primary");
    }
};

updateStatusInfo = function() {
    console.log('In updateStatusInfo:\n')
    // update database
    var elem = document.getElementById("si_db");
    var db_elem = document.getElementById("database");
    var seldb = db_elem.options[ db_elem.selectedIndex ];
    elem.textContent = seldb.text;
    var label = $("#si_db_label");
    var isDanger = (seldb.value === "localhost");
    setLabelDanger(isDanger, label);
    
    // update tasks
    var user = ImageCompare.username;
    if (user) {
        getTasks(user, updateStatInfoTasks);
    }

};

// called on getTasks success, input are the rows from the view
// todo: should not be global
updateStatInfoTasks = function(json) {
    console.log('In updateStatusInfoTasks:\n')
	
    var result = json;
    var tasks = result.rows;

    var elem = document.getElementById("si_tasks");
    elem.textContent = "You have " + tasks.length + " unfinished tasks.";

    // this is to be updated - hide it if there are no pending tasks
    var curTaskElem = document.getElementById("si_curtask");

    if (tasks.length > 0) {
        curTaskElem.hidden = false;

        // $('#image-row').show();
        //$('#image-row2').show();
        
	    var firstTask = tasks[0].value;

        // now we want to find the task that has the lowest (positive?) task_order
        var minTaskOrder = Number.POSITIVE_INFINITY;
        for (var irow = 0; irow < tasks.length; ++irow) {
            // old ones might not even have a task_order
            var rowVal = tasks[irow].value;
            if (rowVal.task_order && rowVal.task_order < minTaskOrder) {
                firstTask = rowVal;
                minTaskOrder = rowVal.task_order;
            }
        }

        var toDoMsg = document.getElementById("to-do-message");
        toDoMsg.textContent = firstTask['task_description'];
        

        var icl_id = firstTask.image_compare_list;

        var dburl = ImageCompare.TaskFeeder.GetImageDbUrl(); // Might be deprecated

        // FLASK AJAX
        let url= `http://${DNS}:${HTTP_PORT}/get_image_compare_lists?key=${icl_id}`
        // COUCHDB AJAX
        // var fullurl = dburl + "_design/basic_views/_view/image_compare_lists?key=\"" + icl_id + "\"";
        $.ajax({
            url : url,
            // beforeSend: function (xhr) {
                //     xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
                // },
            type : 'GET',
            success : function (json) {
                // debugger
                //console.log("get succeeded : " + JSON.stringify(json));
                var result = json;

                var curIdx = firstTask.current_idx + 1; // because humans usually don't use zero based indexing
                curTaskElem.textContent = "You are on comparison " + curIdx + " of " + result.rows[0].value.count;

            },
            error: function (response) {
                console.log("get failed : " + JSON.stringify(response));
            }
        });
    }
    else {

        // reformat ui
        curTaskElem.hidden = true;
        var imagesDiv = document.getElementById("image-row");
        imagesDiv.style.display = "none";
        //var imagesDiv2 = document.getElementById("image-row2");
        //imagesDiv2.style.display = "none";

        $('#to-do-message').show()
        var toDoMsg = document.getElementById("to-do-message");
        toDoMsg.textContent = "All tasks are complete."
    }
};

var getTasks = function(username, successFn) {

    console.log('In getTasks:\n')
    // COUCHDB AJAX
    // Old Code that directly talks to couchdb
    // var dburl = ImageCompare.TaskFeeder.GetImageDbUrl();
    // var fullurl = dburl + "_design/basic_views/_view/incomplete_compare_tasks?key=\"" + username + "\"";

    // FLASK AJAX
    let fullurl=`http://${DNS}:${HTTP_PORT}/get_tasks/compare?username=${username}`

    // New Code that asks flask to handle credential level transactions
    if(typeof DNS === 'undefined'){
        // debugger;
        // letcompare current_url = location.href;
        setTimeout(window.location.reload, 1000)
        
    }else{
        $.ajax({
            url: fullurl,
            type: 'GET',
            success: successFn,
            error: function(response){
                console.log("get failed : " + JSON.stringify(response));
            }
    
        })
    }

}

// THIS IS A DB PUT
// winVal is a number representing how much A is greater than B
// In a situation where the user can pick one or the other or neither
// winVal will be -1, 0, or 1. This can support other values for UIs
// where the user can say "A five times more than B"
// todo - this should not be global
createICResult = function(winVal, img0, img1, user, comment, task, task_idx) {
    console.log('createICResult')
    // todo - this configuration should be external to this function
    // var db_config_elem = document.getElementById("database");
    // var db_config = db_config_elem.options[db_config_elem.selectedIndex].value;
    // var hostname = db_config === "localhost" ?
    //     "http://localhost:"+DB_PORT+"/" :
    //     "http://"+DNS+":"+DB_PORT+"/";
    // var imageDbName = "ret_images/";
    // var resultsDbName = "ret_images/";
    var dbName = ImageCompare.TaskFeeder.GetImageDbUrl();

    var currentTime = new Date();
    var timeStr = currentTime.toString();
    //  var imgDbStr = hostname + imageDbName;

    var dataStr = "{\"user\":\"" + user + "\",";
    dataStr += "\"type\":\"" + "imageCompareResult" + "\",";
    dataStr += "\"date\":\"" + timeStr + "\",";
    dataStr += "\"image0\":\"" + dbName + img0.toString() + "\",";
    dataStr += "\"image1\":\"" + dbName + img1.toString() + "\",";
    dataStr += "\"winner\":\"" +  winVal.toString() + "\",";
    dataStr += "\"justification\":\"" +  comment + "\","; // -BB- New
    dataStr += "\"task\":\"" +  task._id + "\",";
    dataStr += "\"task_idx\":\"" +  task_idx + "\"";

    dataStr += "}";

    console.log ("Putting (Posting if with Flask): " + dataStr);
    // debugger
    // FLASK AJAX
    let url = `http://${DNS}:${HTTP_PORT}/task_results`;
    // COUCHDB AJAX
    // let url = dbName + generateUUID()
    var def = $.ajax({
        url : url,
        // beforeSend: function (xhr) {
        //     xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
        // },
        // type : 'PUT', // Non-Flask type
        type : 'POST', // Flask Type
        headers : {'Content-Type': 'application/json'},
        //dataType : "jsonp",
        data: dataStr,
        success : function(json) {
            // debugger
            console.log ("put succeeded: " + JSON.stringify(json));
        },
        error: function (response) {
            console.log("put failed : " + JSON.stringify(response));
                        alert ("Network Issue, Result not Recorded. Please stop the task and contact Jayashree.");
        }
    });

    return def;
};

// THIS IS A DB PUT
// increments the task's current idx and posts it back to the database
// user is used to set the next image pair
// todo - this should not be global
updateTask = function(task, user) {
console.log('updateTask') 
// first get the length of the icl for the task, (to see if the task is now complete)
    // COUCHDB AJAX
    // var dburl = ImageCompare.TaskFeeder.GetImageDbUrl();
    // var fullurl = dburl + "_design/basic_views/_view/icl_lengths?key=\"" + task.image_compare_list + "\"";
    // FLASK AJAX
    console.log(`task.image_compare_list: ${task.image_compare_list}`)
    let fullurl= `http://${DNS}:${HTTP_PORT}/icl_lengths?key=${task.image_compare_list}`

    var icl_count = -1;

    var defered = $.ajax({
        url : fullurl,
        // beforeSend: function (xhr) {
        //     xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
        // },
        type : 'GET',
        success : function(json) {
            var result = json;
            icl_count = result.rows[0].value;

            // now that that worked, update the task
            // COUCHDB AJAX
            // var dburl = ImageCompare.TaskFeeder.GetImageDbUrl(); //http://pop-os:5984/image_comparator/c9c326a7b0858614fa570f01b200c2d9
            // var fullurl = dburl + task._id;
            // FLASK AJAX
            let fullurl= `http://${DNS}:${HTTP_PORT}/update_tasks/${task._id}`


            task.current_idx++;
            if (task.current_idx >= icl_count) {
                task.completed = true;
            }
            $.ajax({
                url : fullurl,
                // beforeSend: function (xhr) {
                //     xhr.setRequestHeader ("Authorization", "Basic " + btoa(DB_USER+":"+DB_PASS));
                // },
                type : 'PUT',
                data: JSON.stringify(task),
                contentType: "application/json",
                success : function(json) {
                    //console.log ("put succeeded: " + JSON.stringify(json));
                    ImageCompare.TaskFeeder.SetImagePair(user);
                    updateStatusInfo(); // really this is redundant, but I need to return a deferred for this ajax call - how?
                },
                error: function (response) {
                    console.log("put failed : " + JSON.stringify(response));
                }
            });
        },
        error: function (response) {
            console.log("put failed : " + JSON.stringify(response));
        }
    });

    return defered;
};

OnSetDB = function(sel) {
console.log('OnSetDB')

    console.log ("Database changed to: " + sel.value);
    updateStatusInfo();

    var user_elem = document.getElementById("username");
    var selUserTxt = user_elem.options[ user_elem.selectedIndex ].value;
    ImageCompare.TaskFeeder.SetImage(selUserTxt);
}

OnSetUser = function(username) {
    console.log('OnSetUser')
    console.log ("User changed to: " + username);
    ImageCompare.username = username;
    updateStatusInfo();
    ImageCompare.TaskFeeder.SetImagePair(username);
    document.getElementById('home').focus()
    var imagesDiv = document.getElementById("image-row");
    imagesDiv.style.display = "";
}

// really a private helper
saveResultSetImages = function (winnerId) {
console.log('saveResultsSetImages')
    var img0 = ImageCompare.TaskFeeder.Image0;
    var img1 = ImageCompare.TaskFeeder.Image1;
    var task_idx = ImageCompare.TaskFeeder.current_task_idx;
    var task = ImageCompare.TaskFeeder.current_task;

    // var comment = $("#compare-comment").val(); // -BB- Old and changed 9/17/2021
    
    // If Tie mandatory
    if(winnerId === 0){
        var comment = $("#justification").val();
    }else{
        var comment = "Not Tie";
    }

    // If Tie not mandatory and all submissions require comment or at least an optional comment
    var comment = $("#justification").val();


    var user = ImageCompare.username; // $("#username").val();

    // these two are like a transaction - how to ensure both or neither?

    // not sure why the result is being created with winval of 1
    //var d1 = createICResult(1, img0, img1, user, comment, task, task_idx);

    var d1 = createICResult(winnerId, img0, img1, user, comment, task, task_idx);
    var d2 = updateTask(task, user);
    
    // Update justification back to default;
    // debugger
    $("#justification").val('optional justification')
    // update happens asynchronously, so this would be wrong:
    // ImageCompare.TaskFeeder.SetImagePair(user);
    // instead it has to happen inside the updateTask success
    // Todo: maybe better would be to pass it in.

    // same here - this needs to happen after the previous two
    $.when(d1, d2).then(updateStatusInfo());

    // $('#close-tie-button')[0].click() // BB - will need this to close modal
}

var practice=true
function toggle_practice_mode(){
    p_mode = document.getElementById('practice_mode')
    if (practice === true){
        p_mode.innerHTML = 'Off'
        practice=false
        console.log(p_mode.innerHTML)
        console.log(practice)
    }else{
        p_mode.innerHTML = 'On'
        practice=true
        console.log(p_mode.innerHTML)
        console.log(practice)
    }
}

// function instructions_alert(){ // can probably delete
//     alert(`***************
//     Arrow keys enabled:
//     * Left Arrow: Left Image
//     * Right Arrow: Right Image
//     * Up Arrow: Tie
//     ***************
//     `)
// }

function comment_alert(){
    alert('If you want to provide an optional justification for your decision (left/right/tie), please enter it before you click left/right/tie. The text box will refresh after a decision is made.')
}

document.addEventListener('keydown', function(event) {
    if(practice === true) {
        if(event.keyCode == 37) {
            alert('Left was pressed');
        }
        else if(event.keyCode == 39) {
            alert('Right was pressed');
        }
        else if(event.keyCode == 38) {
            alert('Up was pressed');
        }
    }else if(practice === false){
        if(event.keyCode == 37) {
            saveResultSetImages(1);
        }
        else if(event.keyCode == 39) {
            saveResultSetImages(-1);
        }
        else if(event.keyCode == 38) {
            // $('*[data-target="#tieModal"]')[0].click() // for forced tie justification
            saveResultSetImages(0);
        }
    }

});


OnImage0 = function() {
    saveResultSetImages(1);
};

OnImage1 = function() {
    saveResultSetImages(-1);
};

OnNotSure = function() {
    saveResultSetImages(0);
};

const DB_USER = "";
const DB_PASS = "";
