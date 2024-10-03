
// This file adds shared utilities for ImageCompare objects
// - BB It also adds some global variables that can be used by other js and html files

config_initialization = $.ajax({
  url: "/configuration",
  type: 'GET',
  success: function (response) {
    // Still super insecure, but at least we're converted to flask
    DNS = response['DNS']
    COUCH_DB = response['COUCH_DB']
    DB_PORT = response['DB_PORT']
    HTTP_PORT = response['HTTP_PORT']
    // Set initial values for dropdowns and other default elements 
    database_dropdown = document.getElementById('database')
    database_dropdown.innerHTML = "<option value='" + DNS + "'>" + DNS + "</option>"

    database_dropdown = document.getElementById('si_db')
    database_dropdown.innerHTML = DNS
    // Init App
    init_app(); // Each will separately set this function up
  },
  error: function (response) {
    console.log("config setup failed : " + JSON.stringify(response));
  }
})



// - BB - Attempt to clean up ImageCompare class
// 08/27/2021
function TaskFeeder(config_obj) {
  // Most Attributes and Methods are deigned to be overwritted by inheritance

  // Attributes (may change as db model changes)
  // Meant to be updated and represent app state
  this.app = config_obj['app'];
  this.user = "default";
  // debugger
  this.message = config_obj['message'];
  this.incompleteTasks = [];
  this.currentTask = {};
  this.imageList = [];
  this.cachedClassifyResults = {};
  // Experimental option
  this.gridAppRedirect = true;
  this.fromApp = null; // Don't touch, this is set in this.handleUrlFilter()

  // Flask URLs
  this.url_results_base = `http://${DNS}:${HTTP_PORT}/task_results/`;
  this.url_image_list_base = `http://${DNS}:${HTTP_PORT}/get_image_${this.app}_lists`;
  this.get_base64_data_of_image_from_couch = `http://${DNS}:${HTTP_PORT}/get_image/`;
  this.url_incomplete_tasks_base = `http://${DNS}:${HTTP_PORT}/get_tasks/${this.app}`;
  this.url_reset_to_previous_result = `http://${DNS}:${HTTP_PORT}/reset_to_previous_result/${this.app}`;
  this.url_get_classification_results = `http://${DNS}:${HTTP_PORT}/get_classification_results`;
  this.url_get_pair_results = `http://${DNS}:${HTTP_PORT}/get_pair_results`;

  // this.url_delete_result = `http://${DNS}:${HTTP_PORT}/delete_results/${this.app}`;

  // Methods
  this.setPrompt = function (message = this.message) {
    // debugger
    $('#to-do-message').html(message)
  };

  this.handleUrlFilter = (urlSearchStr) => {
    console.log('In handleUrlFilter:\n')
    qs = new QueryString(urlSearchStr);
    var user = qs.value("username");
    this.fromApp = qs.value("fromApp");
    if (user) {
      this.user = user;
      $("#current_user")[0].innerHTML = user
      $("#current_user")[0].style.color = "green"
      this.OnSetUser(user);
    }

    // if urlSearchStr is not empty, remove the dropdown (db and user options)
    if (urlSearchStr) {
      var elem;
      elem = document.getElementById("database");
      elem.style.display = 'none'; // or ... style.visibility="hidden"; vis takes the same space, but is not shown
      elem = document.getElementById("username");
      // elem.style.display='none';

      // also remove the Status info about the db
      elem = document.getElementById("si_database");
      elem.style.display = 'none';
    }

  };

  /* This (OnSetUser) kicks off most tasks.
     It's importanat as much as possible that we have this high level function kick off
     as many tasks so that future developers don't have to 
     navigate chains of callbacks and ajax calls to find the final
     method or function being called in a string of calls.
     Inevitably JavaScript is event driven and some things really have to wait for
     others to finish so they can act on the returned data. 
     In those cases, nesting of function calls is hard to avoid.
  */
  this.OnSetUser = function (user) {
    console.log('In OnSetUser:\n')
    console.log("User changed to: " + user);
    TF = this;
    this.user = user;
    this.updateUserAndDB();
    var promiseChain = this.getIncompleteTasks()
      .then((response) => { return this.updateStatInfoTasks(response) })
      .then((response) => { return this.getHighestPriorityTask(response) })
      .then((response) => { return this.getTaskImageList(response) })
    if (this.gridAppRedirect && this.app === 'grid') {
      if (this.fromApp === 'classify') {
        // Add a call for classification results if we need their results
        promiseChain = promiseChain
          .then((response) => { return this.getClassificationResults(response) }) // Custom for MIDRC/IKBEOM...need classification results
      } else if (this.fromApp === 'pair') {
        promiseChain = promiseChain
          .then((response) => { return this.getPairResults(response) }) // Custom for MIDRC...need pair results
      }

    } else if (this.app === "classify") {
      // Remove old magnifier glass based on previous image
      if (document.getElementsByClassName("img-magnifier-glass")[0]){
        document.getElementsByClassName("img-magnifier-glass")[0].remove()
      }
    }
    promiseChain = promiseChain
      .then((response) => { this.buildUI(response) }) // response is imageList from 
      .then(
        () => { 
          // $("#home")[0].focus() 
        }
      )
  };

  this.updateUserAndDB = function () {
    console.log('In updateUserAndDB:\n')

    // update user
    var si_user = document.getElementById("si_user");
    var user_elem = document.getElementById("username");
    var selUser = user_elem.options[user_elem.selectedIndex];
    si_user.textContent = selUser.text;
    var label = $("#si_user_label");
    var current_user = document.getElementById("current_user");
    current_user.innerText = this.user;
    current_user.style.color = "green";

    // update database
    var is_db = document.getElementById("si_db"); // is this being used?
    var db_elem = document.getElementById("database");
    var seldb = db_elem.options[db_elem.selectedIndex];
    si_db.textContent = seldb.text;
    var label = $("#si_db_label");

  };

  this.getIncompleteTasks = function () {
    // this.getIncompleteTasks = function(user, successFn) {
    console.log('In getIncompleteTasks:\n')
    // We should have this set a "state" or attribute of TaskFeeder that is the user's incomplete tasks so 
    // other functions can just reference it.
    // FLASK AJAX
    // COUCHDB AJAX
    // debugger
    TF = this;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: this.url_incomplete_tasks_base + `?username=${this.user}`,
        type: 'GET',
        success: function (response) {
          if (response.rows.length === 0 && TF.gridAppRedirect && (TF.app === 'classify' | TF.app === 'pair')) {
            // Redirect once done to grid app
            // debugger;
            var fullurl = `http://${DNS}:${HTTP_PORT}/grid_class?username=${TF.user}&fromApp=${TF.app}`;
            window.location.replace(fullurl);
          } else {
            resolve(response);
          }
        },
        error: function (response) {
          console.log("get of tasks failed : " + JSON.stringify(response));
          reject(Error("get of tasks failed : " + JSON.stringify(response)))
        }
      });
    }) // Promise

  };

  this.updateStatInfoTasks = function (json) {
    // okay, this seems wrong, we got all the tasks - way too much data over the wire
    // filtering should happen on the server side - is this what reduce is for?
    var tasks = json.rows;
    var si_tasks_elem = document.getElementById("si_tasks");
    // this is to be updated - hide it if there are no pending tasks
    var curTaskElem = document.getElementById("si_curtask");
    // debugger
    relevant_tasks_for_this_app = [];
    tasks.forEach((v, i, a) => {
      task = v;
      if (task.value.task_type === this.app && task.value.user === this.user) {
        relevant_tasks_for_this_app.push(task.value)
      }
    })
    this.incompleteTasks = relevant_tasks_for_this_app
    if (relevant_tasks_for_this_app.length > 0) {
      si_tasks_elem.innerText = `${this.incompleteTasks.length} unfinished tasks`
      curTaskElem.hidden = false;
    } else {
      // curTaskElem.hidden = true;
      si_tasks_elem.innerText = "0 unfinished tasks"
      curTaskElem.innerText = "Currently no tasks found"
    }

    return 'updateStatInfoTasks is done'
  };

  this.getHighestPriorityTask = function (input) { // input is a bad name for what is coming through 'updateStatInfoTasks is done'
    tasks = this.incompleteTasks
    var lastHighestPriority = 1000000
    var highestPriorityTaskIndex = 0
    tasks.forEach((v, i, a) => {
      if (i != 0) { // if not the first item
        if (v.task_order < lastHighestPriority) {
          highestPriorityTaskIndex = i
        }
      } else {
        lastHighestPriority = v.task_order
      }
    })

    this.currentTask = this.incompleteTasks[highestPriorityTaskIndex]
    return this.currentTask;
  };

  this.getTaskImageList = function (task) {
    TF = this; // otherwise "this" becomes the $.ajax object
    if (task === undefined) {
      return "no tasks left"
    } else {
      return new Promise((resolve, reject) => {
        // debugger;
        $.ajax({
          url: this.url_image_list_base + `?key=${task.list_name}`,
          type: 'GET',
          success: function (response) {
            if (TF.app === 'compare' | TF.app === 'classify' | TF.app === 'pair') {
              var curTaskElem = document.getElementById("si_curtask");
              curTaskElem.textContent = `You are on ${TF.app} task ` + (task.current_idx + 1) + " of " + response.rows[0].value.count;
            }
            TF.imageList = response.rows[0].value.list;
            resolve(TF.imageList);
          },
          error: function (response) {
            console.log("get of tasks failed : " + JSON.stringify(response));
            reject("get of tasks failed : " + JSON.stringify(response))
          }
        });
      })

    }
  };

  this.buildUI = function (imageList) {
    alert("app not set up to inherit properly") // If you see this it's true. If not, that's a good sign.
  };

  this.getBase64DataOfImageFromCouch = (image_id = 1, htmlID = "image0") => { // For later, not being used yet
    var url1 = `http://${DNS}:${HTTP_PORT}/get_image/${image_id}`
    debugger
    return new Promise((resolve, reject) => {
      fetch(url1)
        .then(response => {
          response_headers = [...response.headers]
          // foreach this response_headers and find file name...also set filename from server
          debugger
          response_headers.forEach((v,i,a)=>{
            if(v[0] === 'content-disposition'){
              filename = v[1].substring(v[1].search("filename=")+"filename=".length, v[1].length)
              if (TF.app === 'classify'){
                TF.nextImg = filename
              }else if (TF.app === 'grid'){
                TF.cachedClassifyResults[image_id]['image_name'] = filename
                // debugger;
                document.getElementById(`${htmlID}_filename`).innerHTML=`filename: ${filename}`
              }
            }
          })
          load_messaging_div = document.getElementById("load_messaging")
          var image_load_message = document.createElement("p");
          image_load_message.innerHTML = `Loading image: ${image_id} ...`
          image_load_message.id = image_id
          load_messaging_div.appendChild(image_load_message)
          return response.text();
        })
        .then(data => {
          $(`#${htmlID}`).attr("src", 'data:image/png;base64,' + data)
          // debugger
          if (htmlID === 'image0'){
            document.getElementById('load_messaging').innerHTML=''
          }else {
            img_message_to_remove = htmlID.replace('image','')
            img_message_to_remove = img_message_to_remove.slice(0,img_message_to_remove.search('_'))
            document.getElementById(img_message_to_remove).remove()  
          }
          // $("#image-from-flask").attr("src", 'data:image/png;base64,' + data)
          // vanilla js
          // document.getElementById('image-from-flask').src = 'data:image/png;base64,' + data;
          resolve(data)
        })
    })
  };

  this.resetToPreviousTaskId = function () {
    TF = this;
    if (TF.currentTask.current_idx === 0) {
        alert('You are on the first task, cannot go back.')
    } else {
        TF.disableButtons();
        $.ajax({
            url: this.url_reset_to_previous_result,
            type: 'POST',
            data: JSON.stringify(this.currentTask),
            headers: { 'Content-Type': 'application/json' },
            success: (response) => {
                TF.OnSetUser(TF.user)
            },
            error: (response) => {
                console.log('resetToPreviousClassification error!')
            },
        });
    }
  };

}