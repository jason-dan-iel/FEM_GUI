var originX = 500;
var originY = 500;
var nodes = [];
var members = [];
var selectedNode = null;
var selectedMember = null;

document
  .getElementById("graph")
  .addEventListener("mousemove", function (event) {
    var svg = document.getElementById("graph");
    var pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    var cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());

    var snappedX = Math.round(cursorpt.x * 2) / 2;
    var snappedY = Math.round(cursorpt.y * 2) / 2;

    var x = snappedX - originX;
    var y = originY - snappedY;

    updateCursorCoordinates(x, y);
  });

function updateCursorCoordinates(x, y) {
  var scaledX = x / 50;
  var scaledY = y / 50;
  var roundedX = Math.round(scaledX * 2) / 2;
  var roundedY = Math.round(scaledY * 2) / 2;
  document.getElementById(
    "cursor-coordinates"
  ).textContent = `X: ${roundedX.toFixed(1)}, Y: ${roundedY.toFixed(1)}`;
}

function addNode(event) {
  var svg = document.getElementById("graph");
  var pt = svg.createSVGPoint();
  pt.x = event.clientX;
  pt.y = event.clientY;
  var cursorpt = pt.matrixTransform(svg.getScreenCTM().inverse());

  // Convert the cursor coordinates to meters using the scale
  var scaledX = (cursorpt.x - originX) / 50;
  var scaledY = (originY - cursorpt.y) / 50;

  // Round the scaled coordinates to the nearest 0.5
  var roundedX = Math.round(scaledX * 2) / 2;
  var roundedY = Math.round(scaledY * 2) / 2;

  // Convert back to pixels for SVG rendering
  var snappedX = roundedX * 50 + originX;
  var snappedY = originY - roundedY * 50;

  // Create and append the node
  var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("class", "node");
  circle.setAttribute("cx", snappedX);
  circle.setAttribute("cy", snappedY);
  circle.setAttribute("r", 5);
  circle.setAttribute("data-index", nodes.length + 1); // Set custom attribute
  svg.getElementById("nodes").appendChild(circle);

  // Always display node number
  var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", snappedX + 10);
  text.setAttribute("y", snappedY - 10);
  text.setAttribute("class", "coordinate-number");
  text.textContent = `(${nodes.length + 1})`;
  svg.appendChild(text);

  // Display a small popup of the coordinates on hover
  circle.addEventListener("mouseover", function () {
    var popup = document.createElementNS("http://www.w3.org/2000/svg", "text");
    popup.setAttribute("x", snappedX + 10);
    popup.setAttribute("y", snappedY - 30);
    popup.setAttribute("class", "coordinate-label");
    popup.textContent = `(${roundedX.toFixed(1)}, ${roundedY.toFixed(1)})`;
    svg.appendChild(popup);
  });

  circle.addEventListener("mouseout", function () {
    var popups = document.querySelectorAll(".coordinate-label");
    popups.forEach(function (popup) {
      popup.remove();
    });
  });

  // Add data to the table
  var tableBody = document.getElementById("node-table-body");
  var row = document.createElement("tr");

  var cellNode = document.createElement("td");
  cellNode.textContent = nodes.length + 1;
  var cellX = document.createElement("td");
  cellX.textContent = roundedX.toFixed(1);
  var cellY = document.createElement("td");
  cellY.textContent = roundedY.toFixed(1);
  var cellFx = document.createElement("td");
  var inputFx = document.createElement("input");
  inputFx.type = "number";
  inputFx.placeholder = "0";
  cellFx.appendChild(inputFx);
  var cellFy = document.createElement("td");
  var inputFy = document.createElement("input");
  inputFy.type = "number";
  inputFy.placeholder = "0";
  cellFy.appendChild(inputFy);
  var cellMz = document.createElement("td");
  var inputMz = document.createElement("input");
  inputMz.type = "number";
  inputMz.placeholder = "0";
  cellMz.appendChild(inputMz);

  var cellSx = document.createElement("td");
  var inputSx = document.createElement("input");
  inputSx.placeholder = "0";
  inputSx.type = "number";
  cellSx.appendChild(inputSx);

  var cellSy = document.createElement("td");
  var inputSy = document.createElement("input");
  inputSy.placeholder = "0";
  inputSy.type = "number";
  cellSy.appendChild(inputSy);

  var cellType = document.createElement("td");
  var inputType = document.createElement("input");
  inputType.placeholder = "Fixed/Pinned/Verticalroller/Horizontalroller";
  inputType.type = "text";
  cellType.appendChild(inputType);

  row.appendChild(cellNode);
  row.appendChild(cellX);
  row.appendChild(cellY);
  row.appendChild(cellFx);
  row.appendChild(cellFy);
  row.appendChild(cellMz);
  row.appendChild(cellSx);
  row.appendChild(cellSy);
  row.appendChild(cellType);

  tableBody.appendChild(row);

  // Add node to nodes array
  nodes.push({ x: roundedX.toFixed(1), y: roundedY.toFixed(1) });

  // Update node table
  updateNodeTable();
}

function addMember(event) {
  var svg = document.getElementById("graph");
  var clickedElement = event.target;

  if (
    clickedElement.tagName.toLowerCase() === "circle" &&
    clickedElement.classList.contains("node")
  ) {
    if (!selectedNode) {
      selectedNode = clickedElement;
      selectedNode.classList.add("selected");
    } else {
      var node1 = selectedNode;
      var node2 = clickedElement;
      console.log(node1, node2);
      addMemberLine(node1, node2);

      selectedNode.classList.remove("selected");
      selectedNode = null;
      node2.classList.remove("selected");
    }
  }
}

function addMemberLine(node1, node2) {
  var svg = document.getElementById("graph");
  var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("class", "member-line");
  line.setAttribute("x1", node1.getAttribute("cx"));
  line.setAttribute("y1", node1.getAttribute("cy"));
  line.setAttribute("x2", node2.getAttribute("cx"));
  line.setAttribute("y2", node2.getAttribute("cy"));
  line.setAttribute("stroke", "black");
  svg.getElementById("members").appendChild(line);

  var tableBody = document.getElementById("member-table-body");
  var row = document.createElement("tr");

  var cellMember = document.createElement("td");
  cellMember.textContent = members.length + 1;
  var cellNode1 = document.createElement("td");
  cellNode1.textContent = node1.getAttribute("data-index"); // Get custom attribute
  var cellNode2 = document.createElement("td");
  cellNode2.textContent = node2.getAttribute("data-index"); // Get custom attribute
  var cellLoadType = document.createElement("td");
  var inputLoadType = document.createElement("input");
  inputLoadType.type = "text";
  inputLoadType.placeholder = "Concentrated/Trapezoidal/Uniform";
  cellLoadType.appendChild(inputLoadType);

  var cellW1 = document.createElement("td");
  var inputW1 = document.createElement("input");
  inputW1.type = "number";
  inputW1.placeholder = "0";
  cellW1.appendChild(inputW1);
  var cellW2 = document.createElement("td");
  var inputW2 = document.createElement("input");
  inputW2.type = "number";
  inputW2.placeholder = "0";
  cellW2.appendChild(inputW2);
  var cellA1 = document.createElement("td");
  var inputA1 = document.createElement("input");
  inputA1.type = "number";
  inputA1.placeholder = "0";
  cellA1.appendChild(inputA1);
  var cellA2 = document.createElement("td");
  var inputA2 = document.createElement("input");
  inputA2.type = "number";
  inputA2.placeholder = "0";
  cellA2.appendChild(inputA2);

  row.appendChild(cellMember);
  row.appendChild(cellNode1);
  row.appendChild(cellNode2);
  row.appendChild(cellLoadType);
  row.appendChild(cellW1);
  row.appendChild(cellW2);
  row.appendChild(cellA1);
  row.appendChild(cellA2);

  tableBody.appendChild(row);

  members.push({
    node1: node1.getAttribute("data-index"), // Get custom attribute
    node2: node2.getAttribute("data-index"), // Get custom attribute
  });
}
function updateMemberTable() {
  var tableBody = document.getElementById("member-table-body");
  tableBody.innerHTML = "";
  members.forEach(function (member, index) {
    var row = document.createElement("tr");

    var cellMember = document.createElement("td");
    cellMember.textContent = index + 1;
    var cellNode1 = document.createElement("td");
    cellNode1.textContent = member.node1;
    var cellNode2 = document.createElement("td");
    cellNode2.textContent = member.node2;

    var cellLoadType = document.createElement("td");
    var inputLoadType = document.createElement("input");
    inputLoadType.type = "text";
    inputLoadType.placeholder = "Concentrated/Trapezoidal/Uniform";
    cellLoadType.appendChild(inputLoadType);

    var cellW1 = document.createElement("td");
    var inputW1 = document.createElement("input");
    inputW1.type = "number";
    inputW1.placeholder = "0";
    cellW1.appendChild(inputW1);
    var cellW2 = document.createElement("td");
    var inputW2 = document.createElement("input");
    inputW2.type = "number";
    inputW2.placeholder = "0";
    cellW2.appendChild(inputW2);
    var cellA1 = document.createElement("td");
    var inputA1 = document.createElement("input");
    inputA1.type = "number";
    inputA1.placeholder = "0";
    cellA1.appendChild(inputA1);
    var cellA2 = document.createElement("td");
    var inputA2 = document.createElement("input");
    inputA2.type = "number";
    inputA2.placeholder = "0";
    cellA2.appendChild(inputA2);

    row.appendChild(cellMember);
    row.appendChild(cellNode1);
    row.appendChild(cellNode2);
    row.appendChild(cellLoadType);
    row.appendChild(cellW1);
    row.appendChild(cellW2);
    row.appendChild(cellA1);
    row.appendChild(cellA2);

    tableBody.appendChild(row);
  });
}

function updateNodeTable() {
  var tableBody = document.getElementById("node-table-body");
  tableBody.innerHTML = "";
  nodes.forEach(function (node, index) {
    var row = document.createElement("tr");

    var cellNode = document.createElement("td");
    cellNode.textContent = index + 1;
    var cellX = document.createElement("td");
    cellX.textContent = node.x;
    var cellY = document.createElement("td");
    cellY.textContent = node.y;
    var cellFx = document.createElement("td");
    var inputFx = document.createElement("input");
    inputFx.type = "number";
    inputFx.placeholder = "0";
    cellFx.appendChild(inputFx);
    var cellFy = document.createElement("td");
    var inputFy = document.createElement("input");
    inputFy.type = "number";
    inputFy.placeholder = "0";
    cellFy.appendChild(inputFy);
    var cellMz = document.createElement("td");
    var inputMz = document.createElement("input");
    inputMz.type = "number";
    inputMz.placeholder = "0";
    cellMz.appendChild(inputMz);
    var cellSx = document.createElement("td");
    var inputSx = document.createElement("input");
    inputSx.placeholder = "0";
    inputSx.type = "number";
    cellSx.appendChild(inputSx);

    var cellSy = document.createElement("td");
    var inputSy = document.createElement("input");
    inputSy.placeholder = "0";
    inputSy.type = "number";
    cellSy.appendChild(inputSy);

    var cellType = document.createElement("td");
    var inputType = document.createElement("input");
    inputType.placeholder = "Fixed/Pinned/Verticalroller/Horizontalroller";
    inputType.type = "text";
    cellType.appendChild(inputType);

    row.appendChild(cellNode);
    row.appendChild(cellX);
    row.appendChild(cellY);
    row.appendChild(cellFx);
    row.appendChild(cellFy);
    row.appendChild(cellMz);
    row.appendChild(cellSx);
    row.appendChild(cellSy);
    row.appendChild(cellType);

    tableBody.appendChild(row);
  });
}

function selectNode() {
  document.getElementById("graph").addEventListener("click", addNode);
  document.querySelectorAll(".node").forEach((node) => {
    node.style.cursor = "pointer";
  });

  document.getElementById("graph").removeEventListener("click", addMember);
}

function selectMember() {
  document.getElementById("graph").addEventListener("click", addMember);
  document.querySelectorAll(".node").forEach((node) => {
    node.style.cursor = "default";
  });

  document.getElementById("graph").removeEventListener("click", addNode);
}

function getPropertiesData() {
  var A = parseFloat(document.getElementById("input-A").value) || 0;
  var E = parseFloat(document.getElementById("input-E").value) || 0;
  var I = parseFloat(document.getElementById("input-I").value) || 0;

  return { A: A, E: E, I: I };
}

function addArrowsForLoads(memberData, nodeData) {
  var svg = document.getElementById("graph");
  var arrowsGroup = svg.getElementById("arrows");
  var arrowscale = 5; // Adjust this value as needed
  var offset = 10; // Offset for lines
  var strokeWidth = 1.5; // Stroke width for arrows
  originX = 500
  originY = 500
  memberData.forEach(function (member) {
    var node1 = nodeData[parseInt(member.node1) - 1]; // -1 because array index starts from 0
    var node2 = nodeData[parseInt(member.node2) - 1]; // -1 because array index starts from 0

    var x1 = parseFloat(node1.x) * 50 + originX;
    var y1 = originY - parseFloat(node1.y) * 50;
    var x2 = parseFloat(node2.x) * 50 + originX;
    var y2 = originY - parseFloat(node2.y) * 50;
    var angle = Math.atan2(y2 - y1, x2 - x1);
    var w1 = parseFloat(member.w1);
    var w2 = parseFloat(member.w2);
    var a1 = parseFloat(member.a1) *50 ;
    var a2 = parseFloat(member.a2) *50;

    if (member.loadType == "Uniform") {
      var distance1 = a1;
      var distance2 = a2;

      var offsetDistance = 20; // Adjust this value as needed for the offset distance

      // Calculate the offset values
      var xOffset1 = offsetDistance * Math.sin(angle);
      var yOffset1 = -offsetDistance * Math.cos(angle);
      var xOffset2 = offsetDistance * Math.sin(angle);
      var yOffset2 = -offsetDistance * Math.cos(angle);

      var x3 = x1 + distance1 * Math.cos(angle) + xOffset1;
      var y3 = y1 + distance1 * Math.sin(angle) + yOffset1;
      var x4 = x2 - distance2 * Math.cos(angle) + xOffset2;
      var y4 = y2 - distance2 * Math.sin(angle) + yOffset2;

      var line1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line1.setAttribute("class", "member-line");
      line1.setAttribute("x1", x3);
      line1.setAttribute("y1", y3);
      line1.setAttribute("x2", x4);
      line1.setAttribute("y2", y4);
      line1.setAttribute("stroke", "red");
      svg.getElementById("members").appendChild(line1);

      var text1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text1.setAttribute("x", (x3 + x4) / 2 + 10);
      text1.setAttribute("y", (y3 + y4) / 2 - 10);
      text1.setAttribute("class", "coordinate-number");
      text1.textContent = `(${-w1}kN)`;
      svg.appendChild(text1);

      var line2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line2.setAttribute("class", "additional-line");
      line2.setAttribute("x1", x1 + distance1 * Math.cos(angle));
      line2.setAttribute("y1", y1 + distance1 * Math.sin(angle));
      line2.setAttribute("x2", x3);
      line2.setAttribute("y2", y3);
      line2.setAttribute("stroke", "red"); // Change color as needed
      svg.getElementById("members").appendChild(line2);

      // Create the line from (x2, y2) to (x4, y4)
      var line3 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line3.setAttribute("class", "additional-line");
      line3.setAttribute("x1", x2 - distance2 * Math.cos(angle));
      line3.setAttribute("y1", y2 - distance2 * Math.sin(angle));
      line3.setAttribute("x2", x4);
      line3.setAttribute("y2", y4);
      line3.setAttribute("stroke", "red"); // Change color as needed
      svg.getElementById("members").appendChild(line3);
    }

    if (member.loadType == "Concentrated") {
      var distance1 = a1;

      var offsetDistance = 20;

      var xOffset1 = offsetDistance * Math.sin(angle);
      var yOffset1 = -offsetDistance * Math.cos(angle);

      var x3 = x1 + distance1 * Math.cos(angle) + xOffset1;
      var y3 = y1 + distance1 * Math.sin(angle) + yOffset1;

      var x4 = x1 + distance1 * Math.cos(angle);
      var y4 = y1 + distance1 * Math.sin(angle);

      var line3 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line3.setAttribute("class", "member-line");
      line3.setAttribute("x1", x3);
      line3.setAttribute("y1", y3);
      line3.setAttribute("x2", x4);
      line3.setAttribute("y2", y4);
      line3.setAttribute("stroke", "red");
      svg.getElementById("members").appendChild(line3);

      var text3 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text3.setAttribute("x", x3 + 10);
      text3.setAttribute("y", y3 - 10);
      text3.setAttribute("class", "coordinate-number");
      text3.textContent = `(${-w1}kN/m)`;
      svg.appendChild(text3);
    }

    if (member.loadType == "Trapezoidal") {
      var distance1 = a1;
      var distance2 = a2;

      var offsetDistance = 20;
      var xOffset1 = offsetDistance * Math.sin(angle);
      var yOffset1 = -offsetDistance * Math.cos(angle);
      var xOffset2 = offsetDistance * Math.sin(angle) * 2;
      var yOffset2 = -offsetDistance * Math.cos(angle) * 2;

      var x3 = x1 + distance1 * Math.cos(angle) + xOffset1;
      var y3 = y1 + distance1 * Math.sin(angle) + yOffset1;
      var x4 = x2 - distance2 * Math.cos(angle) + xOffset2;
      var y4 = y2 - distance2 * Math.sin(angle) + yOffset2;


      var line4 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line4.setAttribute("class", "member-line");
      line4.setAttribute("x1", x3);
      line4.setAttribute("y1", y3);
      line4.setAttribute("x2", x4);
      line4.setAttribute("y2", y4);
      line4.setAttribute("stroke", "red");
      svg.getElementById("members").appendChild(line4);

      var text4 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text4.setAttribute("x", x3 + 10);
      text4.setAttribute("y", y3 - 10);
      text4.setAttribute("class", "coordinate-number");
      text4.textContent = `(${-w1}kN)`;
      svg.appendChild(text4);

      var line5 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line5.setAttribute("class", "additional-line");
      line5.setAttribute("x1", x1 + distance1 * Math.cos(angle));
      line5.setAttribute("y1", y1 + distance1 * Math.sin(angle));
      line5.setAttribute("x2", x3 );
      line5.setAttribute("y2", y3 );
      line5.setAttribute("stroke", "red"); // Change color as needed
      svg.getElementById("members").appendChild(line5);

      var text5 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text5.setAttribute("x", x4 + 10);
      text5.setAttribute("y", y4 - 10);
      text5.setAttribute("class", "coordinate-number");
      text5.textContent = `(${-w2}kN)`;
      svg.appendChild(text5);
      var line6 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      line6.setAttribute("class", "additional-line");
      line6.setAttribute("x1", x2 - distance2 * Math.cos(angle));
      line6.setAttribute("y1", y2 - distance2 * Math.sin(angle));
      line6.setAttribute("x2", x4);
      line6.setAttribute("y2", y4);
      line6.setAttribute("stroke", "red"); // Change color as needed
      svg.getElementById("members").appendChild(line6);
    }
  });
}

function saveData() {
  var nodeData = [];
  document.querySelectorAll("#node-table-body tr").forEach((row) => {
    var node = {
      x: row.cells[1].textContent,
      y: row.cells[2].textContent,
      Fx: row.cells[3].querySelector("input").value || 0,
      Fy: row.cells[4].querySelector("input").value || 0,
      Mz: row.cells[5].querySelector("input").value || 0,
      Sx: row.cells[6].querySelector("input").value || 0,
      Sy: row.cells[7].querySelector("input").value || 0,
      supportType: row.cells[8].querySelector("input").value || "Free",
    };
    nodeData.push(node);
  });

  var memberData = [];
  document.querySelectorAll("#member-table-body tr").forEach((row) => {
    var member = {
      node1: row.cells[1].textContent,
      node2: row.cells[2].textContent,
      loadType: row.cells[3].querySelector("input").value || "none",
      w1: row.cells[4].querySelector("input").value || 0,
      w2: row.cells[5].querySelector("input").value || 0,
      a1: row.cells[6].querySelector("input").value || 0,
      a2: row.cells[7].querySelector("input").value || 0,
    };
    memberData.push(member);
  });
  var propertiesData = getPropertiesData();

  fetch("/save_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nodeData: nodeData,
      memberData: memberData,
      propertiesData: propertiesData,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Data saved successfully.");
        nodeData = data.nodeData;
        memberData = data.memberData;
        addArrowsForLoads(memberData, nodeData);
      } else {
        alert("Failed to save data.");
      }
    })
    .catch((error) => {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    });
}

function addNodeFromData(nodeData) {
  var svg = document.getElementById("graph");

  // Convert the node coordinates to pixels for SVG rendering
  var snappedX = parseFloat(nodeData.x) * 50 + originX;
  var snappedY = originY - parseFloat(nodeData.y) * 50;

  // Create and append the node circle
  var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("class", "node");
  circle.setAttribute("cx", snappedX);
  circle.setAttribute("cy", snappedY);
  circle.setAttribute("r", 5);
  circle.setAttribute("data-index", nodeData.nodeNumber); // Set custom attribute
  svg.getElementById("nodes").appendChild(circle);

  // Display a small popup of the coordinates on hover
  circle.addEventListener("mouseover", function () {
    var popup = document.createElementNS("http://www.w3.org/2000/svg", "text");
    popup.setAttribute("x", snappedX + 10);
    popup.setAttribute("y", snappedY - 30);
    popup.setAttribute("class", "coordinate-label");
    popup.textContent = `(${parseFloat(nodeData.X).toFixed(1)}, ${parseFloat(
      nodeData.Y
    ).toFixed(1)}, ${parseFloat(nodeData.Theta).toFixed(1)})`;
    svg.appendChild(popup);
  });

  circle.addEventListener("mouseout", function () {
    var popups = document.querySelectorAll(".coordinate-label");
    popups.forEach(function (popup) {
      popup.remove();
    });
  });

  // Add arrows for H, V, and M
  var arrowsGroup = svg.getElementById("arrows");
  var arrowscale = 5; // Adjust this value as needed
  var offset = 10; // Offset for lines
  var strokeWidth = 1.5; // Stroke width for arrows

  // Horizontal arrow for H
  if (parseFloat(nodeData.H) !== 0) {
    var hArrow = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var hLength = 50; // Fixed length for horizontal arrow
    hArrow.setAttribute("x1", snappedX - hLength);
    hArrow.setAttribute("y1", snappedY);
    hArrow.setAttribute("x2", snappedX);
    hArrow.setAttribute("y2", snappedY);
    hArrow.setAttribute("stroke", "blue");
    hArrow.setAttribute("stroke-width", strokeWidth);
    hArrow.setAttribute("class", "arrow");
    hArrow.setAttribute(
      "data-tooltip",
      `H: ${parseFloat(nodeData.H).toFixed(1)}`
    );
    arrowsGroup.appendChild(hArrow);

    // Add arrowhead
    var markerH = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    markerH.setAttribute("id", "arrowheadH");
    markerH.setAttribute("markerWidth", "10");
    markerH.setAttribute("markerHeight", "10");
    markerH.setAttribute("refX", "0");
    markerH.setAttribute("refY", "3");
    markerH.setAttribute("orient", "auto"); // Change orientation
    var arrowheadPathH = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    arrowheadPathH.setAttribute("d", "M0,0 L9,3 L0,6 z");
    arrowheadPathH.setAttribute("fill", "blue");
    markerH.appendChild(arrowheadPathH);
    svg.appendChild(markerH);

    // Associate arrowhead with line
    hArrow.setAttribute("marker-end", "url(#arrowheadH)");

    // Display tooltip on hover
    hArrow.addEventListener("mouseover", function () {
      var tooltip = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      tooltip.setAttribute("x", snappedX - hLength - 10);
      tooltip.setAttribute("y", snappedY - 10);
      tooltip.setAttribute("class", "arrow-tooltip");
      tooltip.textContent = `H: ${parseFloat(nodeData.H).toFixed(1)}`;
      svg.appendChild(tooltip);
    });

    hArrow.addEventListener("mouseout", function () {
      var tooltips = document.querySelectorAll(".arrow-tooltip");
      tooltips.forEach(function (tooltip) {
        tooltip.remove();
      });
    });
  }

  if (parseFloat(nodeData.V) !== 0) {
    var vArrow = document.createElementNS("http://www.w3.org/2000/svg", "line");
    var vLength = 50; // Fixed length for vertical arrow
    vArrow.setAttribute("x1", snappedX);
    vArrow.setAttribute("y1", snappedY + vLength);
    vArrow.setAttribute("x2", snappedX);
    vArrow.setAttribute("y2", snappedY);
    vArrow.setAttribute("stroke", "green");
    vArrow.setAttribute("stroke-width", strokeWidth);
    vArrow.setAttribute("class", "arrow");
    vArrow.setAttribute(
      "data-tooltip",
      `V: ${parseFloat(nodeData.V).toFixed(1)}`
    );
    arrowsGroup.appendChild(vArrow);

    // Add arrowhead
    var markerV = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    markerV.setAttribute("id", "arrowheadV");
    markerV.setAttribute("markerWidth", "10");
    markerV.setAttribute("markerHeight", "10");
    markerV.setAttribute("refX", "0");
    markerV.setAttribute("refY", "3");
    markerV.setAttribute("orient", "auto"); // Change orientation
    var arrowheadPathV = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    arrowheadPathV.setAttribute("d", "M0,0 L9,3 L0,6 z");
    arrowheadPathV.setAttribute("fill", "green");
    markerV.appendChild(arrowheadPathV);
    svg.appendChild(markerV);

    // Associate arrowhead with line
    vArrow.setAttribute("marker-end", "url(#arrowheadV)");

    // Display tooltip on hover
    vArrow.addEventListener("mouseover", function () {
      var tooltip = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      tooltip.setAttribute("x", snappedX + 10);
      tooltip.setAttribute("y", snappedY + vLength + 10);
      tooltip.setAttribute("class", "arrow-tooltip");
      tooltip.textContent = `V: ${parseFloat(nodeData.V).toFixed(1)}`;
      svg.appendChild(tooltip);
    });

    vArrow.addEventListener("mouseout", function () {
      var tooltips = document.querySelectorAll(".arrow-tooltip");
      tooltips.forEach(function (tooltip) {
        tooltip.remove();
      });
    });
  }

  // Semicircle arrow for M
  if (parseFloat(nodeData.M) !== 0) {
    var mArrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var mLength = 25; // Fixed length for curve
    var mArrowPath = `M ${snappedX - mLength} ${snappedY}`;
    mArrowPath += `A ${mLength} ${mLength} 0 0 1 ${
      snappedX + mLength
    } ${snappedY}`;
    mArrow.setAttribute("d", mArrowPath);
    mArrow.setAttribute("stroke", "red");
    mArrow.setAttribute("stroke-width", strokeWidth);
    mArrow.setAttribute("fill", "none");
    mArrow.setAttribute("class", "arrow");
    mArrow.setAttribute(
      "data-tooltip",
      `M: ${parseFloat(nodeData.M).toFixed(1)}`
    );
    arrowsGroup.appendChild(mArrow);

    // Add arrowhead
    var markerM = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    markerM.setAttribute("id", "arrowheadM");
    markerM.setAttribute("markerWidth", "10");
    markerM.setAttribute("markerHeight", "10");
    markerM.setAttribute("refX", "0");
    markerM.setAttribute("refY", "3");
    markerM.setAttribute("orient", "auto-start-reverse"); // Change orientation
    var arrowheadPathM = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    arrowheadPathM.setAttribute("d", "M0,0 L9,3 L0,6 z");
    arrowheadPathM.setAttribute("fill", "red");
    markerM.appendChild(arrowheadPathM);
    svg.appendChild(markerM);

    // Associate arrowhead with line
    mArrow.setAttribute("marker-start", "url(#arrowheadM)");

    // Display tooltip on hover
    mArrow.addEventListener("mouseover", function () {
      var tooltip = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      tooltip.setAttribute("x", snappedX - mLength - 100);
      tooltip.setAttribute("y", snappedY + 10);
      tooltip.setAttribute("class", "arrow-tooltip");
      tooltip.textContent = `M: ${parseFloat(nodeData.M).toFixed(1)}`;
      svg.appendChild(tooltip);
    });

    mArrow.addEventListener("mouseout", function () {
      var tooltips = document.querySelectorAll(".arrow-tooltip");
      tooltips.forEach(function (tooltip) {
        tooltip.remove();
      });
    });
  }
}

function computeData() {
  fetch("/compute_data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}), // Add any data if required
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Computation successful!");
        data.data.forEach((node) => {
          addNodeFromData(node);
        });
      } else {
        alert("Computation failed.");
      }
    })
    .catch((error) => {
      console.error("Error computing data:", error);
      alert("An error occurred while computing data.");
    });
}
