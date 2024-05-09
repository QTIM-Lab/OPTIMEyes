

dupInfoColumns = {
    user    :  0,
    icl     :  1,
    numRes  :  2,
    numDups :  3,
    numSame :  4,
    numDiff :  5,
    sameAv  :  6, // average of the difference between ranks of the images
    sameMd  :  7, // median 
    sameSd  :  8, // standard deviation
    diffAv  :  9, // average of the difference between ranks of the images
    diffMd  :  10, // median 
    diffSd  :  11, // standard deviation
};


populateDuplicateTableInfo = function() {

    //var msg = Users.join(", ");
    // alert(msg);
    
    var tableBody = document.getElementById("dupInfoTableBody");
    tableBody.innerHTML = "";
    
    var users = Users;
    var tasks = [];
    getTasks(null, buildTable);
    
}

// populates users and tasks
buildTable = function(json) {

    var tableElem = document.getElementById("dupInfoTableBody");

    var result = jQuery.parseJSON( json );
    var taskRows = result.rows;
    var tasks = [];
    taskRows.forEach(function(tr) { tasks.push(tr.value); });
    
    tasks.forEach(function(task) {
        var newRow   = tableElem.insertRow(tableElem.rows.length);
        var userCell = newRow.insertCell(dupInfoColumns.user);
        var iclCell  = newRow.insertCell(dupInfoColumns.icl);
        
        var newText  = document.createTextNode(task.image_compare_list);
        iclCell.appendChild(newText);

        newText  = document.createTextNode(task.user);
        userCell.appendChild(newText);        
    
        // now get results for this task and calc #dups and #dups agree 
        getResults(task._id, addDupInfoToTableRow, newRow);
    });
    

}

// cell in closure variable called extra2
addDupInfoToTableRow = function(json, tableRow) {
    
    var result = jQuery.parseJSON( json );
    var resultRows = result.rows;
    var results = [];
    resultRows.forEach(function(row) { results.push(row.value); });
    
    var cell = tableRow.insertCell(dupInfoColumns.numRes);
    var newTxt  = document.createTextNode(results.length.toString());
    cell.appendChild(newTxt);

    // pour through results looking for duplicates
    var noDupList = [];
    var sameList = [];
    var diffList = [];
    var numDups = 0;
    var numSame = 0;
    var numDiff = 0; // == numDups - numSame
    var resWinner, nodupWinner;
    
    results.forEach(function (res) {    
    
        resWinner = null;
        nodupWinner = null;
        
        var found = false;
        noDupList.forEach(function(nodup) {
            
            if ((nodup.image0 === res.image0 && nodup.image1 === res.image1) ||
                (nodup.image0 === res.image1 && nodup.image1 === res.image0)) {

                found = true;
                numDups++;                
                
                resWinner = (res.winner === "1") ? res.image0 : res.image1;
                nodupWinner = (nodup.winner === "1") ? nodup.image0 : nodup.image1;
                
                (resWinner === nodupWinner) ? numSame++ : numDiff++; 
                (resWinner === nodupWinner) ? sameList.push(res) : diffList.push(res);
            }
        });
        
        if (!found) {
            noDupList.push(res);
        }                
    });
    
    // need the sort order of the images
    // for the same pairs, calc diff between ranks
    //
    // duplicated calculation- sortResults should do that, sort the results 
    // clearly data formats need revisit
    var sortedImages = sortResults(resultRows);
    
    // tag each result with the rank diff
    addRankDiffToResults(sortedImages, results);    
    
    cell = tableRow.insertCell(dupInfoColumns.numDups);
    newTxt  = document.createTextNode(numDups.toString());
    cell.appendChild(newTxt);
  
    cell = tableRow.insertCell(dupInfoColumns.numSame);
    newTxt  = document.createTextNode(numSame.toString());
    cell.appendChild(newTxt);  
    
    cell = tableRow.insertCell(dupInfoColumns.numDiff);
    newTxt  = document.createTextNode(numDiff.toString());
    cell.appendChild(newTxt); 
    
    // build a vector of rank diffs for sames to do some stats on
    var rankDiffs = [];    
    sameList.forEach(function(res) {
        rankDiffs.push(res.rankDiff);
    });
    
    // test jstat
    var myVect = [2,6,4,7,2,7,4],
    jObj = jStat( myVect );
    var tot = jStat.sum(myVect);
    console.log(tot);
    var mean = jStat.mean(myVect);
    var med = jStat.median(myVect);
    var std = jStat.stdev(myVect);
    console.log ("m, md, sd: " + mean.toFixed(2) + " " + med.toFixed(2) + " " + std.toFixed(2) );
    
    if (results.length > 0) {
        var mean = jStat.mean(rankDiffs);
        var med = jStat.median(rankDiffs);
        var std = jStat.stdev(rankDiffs);
        
        cell = tableRow.insertCell(dupInfoColumns.sameAv);
        newTxt  = document.createTextNode(mean.toFixed(2));
        cell.appendChild(newTxt);

        cell = tableRow.insertCell(dupInfoColumns.sameMd);
        newTxt  = document.createTextNode(med.toFixed(2));
        cell.appendChild(newTxt); 

        cell = tableRow.insertCell(dupInfoColumns.sameSd);
        newTxt  = document.createTextNode(std.toFixed(2));
        cell.appendChild(newTxt); 
        
        rankDiffs = [];    
        diffList.forEach(function(res) {
            rankDiffs.push(res.rankDiff);
        });
        
        mean = jStat.mean(rankDiffs);
        med = jStat.median(rankDiffs);
        std = jStat.stdev(rankDiffs);
        
        cell = tableRow.insertCell(dupInfoColumns.diffAv);
        newTxt  = document.createTextNode(mean.toFixed(2));
        cell.appendChild(newTxt);

        cell = tableRow.insertCell(dupInfoColumns.diffMd);
        newTxt  = document.createTextNode(med.toFixed(2));
        cell.appendChild(newTxt); 

        cell = tableRow.insertCell(dupInfoColumns.diffSd);
        newTxt  = document.createTextNode(std.toFixed(2));
        cell.appendChild(newTxt); 
    }
    
};

addRankDiffToResults = function(sortedImages, results){

    var r0, r1;
    
    results.forEach(function(res) {
        r0 = sortedImages.indexOf(res.image0);
        r1 = sortedImages.indexOf(res.image1);

        if (r0 === -1 || r1 === -1) {
            alert("image not found");
        }
        
        res.rankDiff = Math.abs(r0 - r1);
        
    });
};




