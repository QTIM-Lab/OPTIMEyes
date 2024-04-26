// assumes d3


// div is a d3 selection of the container div
buildClassifyButtonGroup = function(div, diagType) {
    console.log('In buildClassifyButtonGroup:\n')
    var inner = div.append('div')
        .classed('btn-group', true)
        .attr('id',diagType);
      //  .attr('data-toggle','buttons');

    buildClassifyButton(inner, 'Normal',diagType);
    buildClassifyButton(inner, 'PrePlus', diagType);
    buildClassifyButton(inner, 'Plus', diagType);
}

buildClassifyButton = function(div, name, diagType) {
    console.log('In buildClassifyButton:\n')
    var classes ='btn btn-primary ' + name + ' ' + diagType;

    div.append('button')
        .classed(classes, true)
        .attr('type', 'button') // what's this for?
        .attr('id', name)
        //.on('click', 'OnClassify(this)')
        .text(name);
}

//
handleUrlFilter = function(urlSearchStr) {
    console.log('In handleUrlFilter:\n')
    //alert(urlSearchStr);
    qs= new QueryString(urlSearchStr);
    var user = qs.value("username");
    if (user) {

        ImageCompare.username = user;

        $("#username").val(user);
        OnSetUser(user);
    }

    // if urlSearchStr is not empty, remove the dropdown (db and user options)
    if (urlSearchStr) {
        var elem;
        elem = document.getElementById("database");
        elem.style.display='none'; // or ... style.visibility="hidden"; vis takes the same space, but is not shown
        elem = document.getElementById("username");
        elem.style.display='none';

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
