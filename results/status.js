
var Users = [
    "testuser" ,
    "mike"     ,
    "susan"    ,
    "paul"     ,
    "karyn"    ,
    "paul"     ,
    "tom"      ,
    "nina"     ,
    "jason"    ,
    "maria"    ,
    "kim"      ,
    "tony"     ,
    "anton"    ];



$(document).ready(function(){

    updateStatusInfo();
    var user = $("#username").val();

    populateDuplicateTableInfo();

});

getSelectedDbUrl = function() {

    var imageDbName = "ret_images/";
    var db_config_elem = document.getElementById("database");
    var db_config = db_config_elem.options[db_config_elem.selectedIndex].value;
    var hostname = db_config == "localhost" ?
        "http://localhost:54956/" :
        "http://ec2-34-201-70-163.compute-1.amazonaws.com:54956/";

    return hostname + imageDbName;
}

// TODO - remove duplication! I'm talking to YOU!

// labels can be either primary or danger
// just for controlling the color through bootstrap
setLabelDanger = function(isDanger, label) {

    if (isDanger) {
        label.removeClass("label-primary");
        label.addClass("label-danger");
    } else {
        label.removeClass("label-danger");
        label.addClass("label-primary");
    }
};

// TODO - remove duplication! I'm talking to YOU!

updateStatusInfo = function() {

    // update user
    var elem = document.getElementById("si_user");
    var user_elem = document.getElementById("username");
    var selUser = user_elem.options[ user_elem.selectedIndex ];
    elem.textContent = selUser.text;
    var label = $("#si_user_label");
    var isDanger = (selUser.value === "testuser");
    setLabelDanger(isDanger, label);

    // update database
    var elem = document.getElementById("si_db");
    var db_elem = document.getElementById("database");
    var seldb = db_elem.options[ db_elem.selectedIndex ];
    elem.textContent = seldb.text;
    var label = $("#si_db_label");
    var isDanger = (seldb.value === "localhost");
    setLabelDanger(isDanger, label);

    var myDiv = document.getElementById("si_icl_list");
    myDiv.innerHTML = "";
    getTasks(selUser.value, updateTaskDropdown);

};

// called on getTasks success, input are the rows from the view
// todo: should not be global
updateTaskDropdown = function(json) {
    var result = jQuery.parseJSON( json );
    var tasks = result.rows;

    var elem = document.getElementById("si_tasks");
    elem.textContent = "You have " + tasks.length + " tasks.";

    // this is to be updated - hide it if there are no pending tasks
    var curTaskElem = document.getElementById("si_curtask");

    if (tasks.length > 0) {

        var firstTask = tasks[0].value;
        var user = firstTask.user; // all the tasks belong to the same user
        var myDiv = document.getElementById("si_icl_list");

        tasks.forEach(function(task) {
            var sel = document.createElement("input");
            sel.setAttribute("type", "radio");
            sel.setAttribute("name", "taskId");
            sel.setAttribute("value", task.id);
            sel.addEventListener('click', OnSetTaskIdx, false);

            myDiv.appendChild(sel);
        });
    }
};


OnSetTaskIdx = function() {
    var taskId = document.querySelector('input[name="taskId"]:checked').value;

    var user = $("#username").val();

    displayStatus(user, taskId);
    chartIclDistribution(user, taskId);
};

// TODO - remove duplication! I'm talking to YOU!
OnSetDB = function(sel) {
    console.log ("Database changed to: " + sel.value);
    updateStatusInfo();
    populateDuplicateTableInfo();
}

// TODO - remove duplication! I'm talking to YOU!
OnSetUser = function(sel) {

    console.log ("User changed to: " + sel.value);
    updateStatusInfo();
}

// TODO - remove duplication! I'm talking to YOU!
var getTasks = function(username, successFn) {

    var keyStr = username ? "?key=\"" + username + "\"" : "";

    var dburl = getSelectedDbUrl();
    var taskViewUrl = dburl + "_design/basic_views/_view/tasks";
    var fullurl = taskViewUrl + keyStr;

    $.ajax({
        url : fullurl,
        type : 'GET',
        success : successFn,
        error: function (response) {
            console.log("get failed : " + JSON.stringify(response));
        }
    });
}

// the extra variable will be passed to the successFn
var getResults = function(taskId, successFn, extra) {

    var keyStr = taskId ? "?key=\"" + taskId + "\"" : "";

    var dburl = getSelectedDbUrl();
    var resultsViewUrl = dburl + "_design/basic_views/_view/taskresults";
    var fullurl = resultsViewUrl + keyStr;

    $.ajax({
        url : fullurl,
        type : 'GET',
        success : function(json) {
            // immediate function to get the closure
            successFn(json, extra);
        },
        error: function (response) {
            console.log("get failed : " + JSON.stringify(response));
        }
    });
}



// var getTaskToIcl = function(username) {

    // var dburl = getSelectedDbUrl();
    // var fullurl = dburl + "_design/basic_views/_view/task2icl";

    // $.ajax({
        // url : fullurl,
        // type : 'GET',
        // success : function (json) {
            // console.log("get succeeded : " + JSON.stringify(json));
            // var result = jQuery.parseJSON( json );

            // //filter by user
            // var userIcls = result.rows.filter(function(task) { return task.key === user; } );

            // var myDiv = document.getElementById("si_icl_list");

            // userIcls.forEach(function(task) {
                // var sel = document.createElement("input");
                // sel.setAttribute("type", "radio");
                // sel.setAttribute("name", "iclIdx");
                // sel.setAttribute("value", task.key);
                // sel.addEventListener('click', OnSetTaskIdx, false);

                // myDiv.appendChild(sel);
            // });

        // },
        // error: function (response) {
            // console.log("get failed : " + JSON.stringify(response));
        // }
    // });
// }


function winSort(a, b, numTimesWon, numTimesShown, resultArray) {
    var winRateA=numTimesWon[a]/numTimesShown[a];
    var winRateB=numTimesWon[b]/numTimesShown[b];

    if (winRateA===winRateB) {
        console.log(a,b);
        var aRes = resultArray.filter(function(result){
            return result.value.image0 === a && result.value.image1===b;
        });

        var bRes = resultArray.filter(function(result){
            return result.value.image0 === b && result.value.image1===a;
        });

        //console.log(aRes);
        //console.log(bRes);

        var tieRes = resultArray.filter(function(result){
            return  ((result.value.image0 === a && result.value.image1===b) ||
                    (result.value.image0 === b && result.value.image1===a));
        });

        var aWins = 0;
        var bWins = 0;

        tieRes.forEach(function(res) {
            if (res.value.winner ===1) {
                if (result.value.image0 === a) {
                  aWins++;
                } else {
                  bWins++;
                }
            }
            if (res.value.winner === -1 ) {
                if (res.value.image0 === a) {
                  bWins++;
                } else {
                  aWins++;
                }
            }
        });

        return  (aWins < bWins) ? 1 : -1;
    }

    return (winRateA < winRateB) ? 1:-1;
}

sortResults = function(resultArray) {

    // first build hash, one entry per image, counting #times shown
    var numTimesShown = {};
    for (var ires = 0 ; ires < resultArray.length; ++ires) {
        var res = resultArray[ires].value;

        if (!numTimesShown[res.image0])
            numTimesShown[res.image0] = 0;

        if (!numTimesShown[res.image1])
            numTimesShown[res.image1] = 0;

        numTimesShown[res.image0]++;
        numTimesShown[res.image1]++;
    }

    // next build hash, one entry per image, counting #times winner
    var numTimesWon = {};
    for (var ires = 0 ; ires < resultArray.length; ++ires) {
        var res = resultArray[ires].value;

        if (!numTimesWon[res.image0])
            numTimesWon[res.image0] = 0;

        if (!numTimesWon[res.image1])
            numTimesWon[res.image1] = 0;

        //if (res.winner === "0")
        if (res.winner === "1")
            numTimesWon[res.image0]++;

        if (res.winner === "-1")
            numTimesWon[res.image1]++;
    }

    var images = Object.keys(numTimesShown);

    var images2 = [
      "http://localhost:54956/ret_images/1",
      "http://localhost:54956/ret_images/2",
      "http://localhost:54956/ret_images/3",
      "http://localhost:54956/ret_images/4"
    ]

    //console.log(images);


    var sortedImages = images.sort(function (a, b) {
      var winRateA=numTimesWon[a]/numTimesShown[a];
      var winRateB=numTimesWon[b]/numTimesShown[b];

      if (winRateA===winRateB) {
          console.log(a,b);
          var aRes = resultArray.filter(function(result){
              return result.value.image0 === a && result.value.image1===b;
          });

          var bRes = resultArray.filter(function(result){
              return result.value.image0 === b && result.value.image1===a;
          });

          //console.log(aRes);
          //console.log(bRes);

          var tieRes = resultArray.filter(function(result){
              return  ((result.value.image0 === a && result.value.image1===b) ||
                      (result.value.image0 === b && result.value.image1===a));
          });

          var aWins = 0;
          var bWins = 0;

          tieRes.forEach(function(res) {
              if (res.value.winner ===1) {
                  if (result.value.image0 === a) {
                    aWins++;
                  } else {
                    bWins++;
                  }
              }
              if (res.value.winner === -1 ) {
                  if (res.value.image0 === a) {
                    bWins++;
                  } else {
                    aWins++;
                  }
              }
          });

          return  (aWins < bWins) ? 1 : -1;
      }

      return (winRateA < winRateB) ? 1:-1;

    });


    //console.log(sortedImages);
    return sortedImages;
}

// add a bunch of images
displayResults=function(resArray){

  console.log(resArray);
  var div = document.getElementById('image-container');
  div.innerHTML = ""; // clear any existing results

  resArray.forEach(function(res){
    var img = new Image();
    var div = document.getElementById('image-container');

    img.onload = function() {
    //  div.appendChild(img);
    };

    img.src = res + "/image";
    img.className="thumbnail";

    img.onclick=onclickthumbnail;
//    img.onclick=(function(){
  //    return onclickthumbnail;
  //  })();
    div.appendChild(img);
  });
}

onclickthumbnail=function(){
  var elem=document.getElementById("full-size-image");
  elem.src=this.currentSrc;
}

displayStatus=function(user, taskId){

  var dbname = getSelectedDbUrl();

  // get the task results for this taskId
  var fullurl = dbname + '_design/basic_views/_view/taskresults?key=\"' + taskId + '\"';
  $.ajax({
    url : fullurl,
    type : 'GET',
    success : function(json) {
      //console.log(json);
      var results = jQuery.parseJSON( json );

      var sortedRes = sortResults(results.rows);
      //console.log(sortedRes);

      displayResults(sortedRes);

      var rc=document.getElementById("rowCt");
      rc.textContent=
        results.total_rows + " total results, " +
        results.rows.length + " results for this task, and " +
        sortedRes.length + " images in sorted order:";
    },
    error: function (response) {
      console.log("get failed : " + JSON.stringify(response));
    }
  });
}

OnCalcInternCons= function(){

    var taskId = document.querySelector('input[name="taskId"]:checked').value;
    var user = $("#username").val();

    var res = getInternalConsistencyMeasure(user, taskId);
    var infoElem = document.getElementById("intConMeasInfo");
    infoElem.textContent = "querying ...";
};
