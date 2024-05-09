
// this file requires status.js 
// for getSelectedDbUrl


getInternalConsistencyMeasure = function(user, taskId) {

  var dbname = getSelectedDbUrl();

  // get the task results for this taskId
  var fullurl = dbname + '_design/basic_views/_view/taskresults?key=\"' + taskId + '\"';
  $.ajax({
    url : fullurl,
    type : 'GET',
    success : function(json) {
      //console.log(json);
      var results = jQuery.parseJSON( json );
      
      var resRows = results.rows;
      var taskResults = [];
      resRows.forEach(function(row) {taskResults.push(row.value);}); 
      
      // what's the icl for this task?
      var task2iclUrl = dbname + '_design/basic_views/_view/task2iclByTaskId?key=\"' + taskId + '\"';
      $.ajax({
        url : task2iclUrl,
        type : 'GET',
        success : function(json) {
           var results = jQuery.parseJSON( json );
           
           if (results.rows.length != 1) {
               // this is an assert(false)
               // each task should have one and only one icl.
               alert("task with zero or many icls - contact Jayashree");
           }

           var iclName = results.rows[0].value;
           // is there a icl_dup_list for that icl?
           var iclDupListUrl = dbname + '_design/basic_views/_view/icl_dup_lists?key=\"' + iclName + '\"';
           $.ajax({
            url : iclDupListUrl,
            type : 'GET',
            success : function(json) {
             var results = jQuery.parseJSON( json );
             if (results.rows.length == 0) {
               // icl does not have a dup list doc
               alert("The image_compare_list with name \"" + iclName + "\" is missing an icl_dup_list doc. Run \"ruby makeIclDupList " + iclName + "\"" );
             }
             // assert if more than one.
             
             var measureText = document.getElementById("intConMeasInfo");
             measureText.textContent= "calculating ... ";
             
             // ok, whew, we have the data - 
             // taskResults for this task id is in a closure
             // here's the duplist
             var duplist = results.rows[0].value.list;
             
             // now, for each element in the task list
             // look to see if the task_idx is one of the duplist entries
             // if so, look for the other entry in the task list
             // if both are there, we can compare them.
             // must be more efficient way ... sort dups first (?)
             var dupTaskResults = [];
             taskResults.forEach(function(res) {
                var taskIdx = parseInt(res.task_idx);
                duplist.forEach(function(dup) {
                    if (dup[0] === taskIdx || dup[1] === taskIdx) {
                       var other = (dup[0] === taskIdx) ? dup[1] : dup[0]; 
                       taskResults.forEach(function(res2) {
                           var otherIdx = parseInt(res2.task_idx);
                           if (otherIdx === other) {
                                // we found a match!
                                dupTaskResults.push([res, res2]);
                           }
                       });
                    }
                });
             });
             
             
            var sames = 0;
            var diffs = 0;
            dupTaskResults.forEach(function(dupTaskResult){

                if (dupTaskResult[0]["image0"] === dupTaskResult[1]["image0"]) {
                    dupTaskResult[0]["winner"] === dupTaskResult[1]["winner"] ? sames++ : diffs++;
                }
                else if (dupTaskResult[0]["image0"] === dupTaskResult[1]["image1"]) {
                    dupTaskResult[0]["winner"] != dupTaskResult[1]["winner"] ? sames++ : diffs++;
                }
                else {
                    alert ("dup list defect");
                }
             });
             
             // this will count everything twice - divide by 2
             var sames = sames/2;
             var diffs = diffs/2;
             
             // finally, put the data on the page
             var samesVerb = (sames === 1) ? "was" : "were";
             var diffsVerb = (diffs === 1) ? "was" : "were";
             measureText.textContent= "Of the " + duplist.length.toString() + " duplicates in this task, " + 
                    sames.toString() + " " + samesVerb +" evaluated the same and " + diffs + " " + diffsVerb + " evaluated oppositely."
            },
            error: function (response) {
              console.log("get failed : " + JSON.stringify(response));
            }
           });
        },
        error: function (response) {
          console.log("get failed : " + JSON.stringify(response));
        }
       });

      

    },
    error: function (response) {
      console.log("get failed : " + JSON.stringify(response));
    }
  });
}





