(function() {
    var max, scale,
        classes = 9,
        scheme = colorbrewer["YlOrRd"][classes],
        container = L.DomUtil.get('hex'),
        map = L.map(container).setView([42.39, -71.0995], 14);


    var osmtiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
    });

    $.getJSON("NBHDs.geojson", function(hoodData) {
        let NBHD = L.geoJson(hoodData, {
            style: function(feature) {
                return {
                    color: "#000",
                    weight: 3,
                    fillColor: "#ffffff00",
                    fillOpacity: .6
                };
            }
        });
   

    d3.json(container.dataset.source, function(collection) {

        var hexlay = L.hexLayer(collection, {
            applyStyle: hex_style
        });
        map.addLayer(osmtiles);
        map.addLayer(hexlay);
        map.addLayer(NBHD);


        var svg = d3.select("#legend")
            .append("svg")
            .attr("height", d3.select("#legend").node().getBoundingClientRect().height)
            .attr("width", d3.select("#legend").node().getBoundingClientRect().width);

        var colorscale = d3.scale.quantize()
            .domain([1, max])
            .range(colorbrewer.YlOrRd[9]);

        function NGon(x, y, N, side, angle) {
            var path = "",
                c, temp_x, temp_y, theta;

            for (c = 0; c <= N; c += 1) {
                theta = (c + 0.5) / N * 2 * Math.PI;
                temp_x = x + Math.cos(theta) * side;
                temp_y = y + Math.sin(theta) * side;
                path += (c === 0 ? "M" : "L") + temp_x + "," + temp_y;
            }
            return path;
        }

        var legend = d3.legend.color()
            .scale(colorscale)
            .shape("path", NGon(0, 0, 6, 10))
            .orient("vertical")
            .labelFormat(d3.format(".0f"))
            .labelOffset(10)
            .title("Number of Permits");

        svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20,20)")
            .call(legend);

    });

    function hex_style(hexagons) {
        if (!(max && scale)) {
            max = d3.max(hexagons.data(), function(d) {
                return d.length;
            });
            scale = d3.scale.quantize()
                .domain([0, max])
                .range(d3.range(classes));
        }


        hexagons
            .attr("stroke", scheme[classes - 1])
            .attr("fill", function(d) {
                return scheme[scale(d.length)];
            })
            .on("mouseover", function(d) {

                d3.select(this)
                    .attr("d", d => d3.hexbin().hexagon(20))
                    .attr("transform", d => "translate(" + d.x + "," + d.y + ")");
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .transition()
                    .duration(400)
                    .attr("d", d => d3.hexbin().hexagon(10));
            });

        $('.hexagon').tipsy({
            gravity: 'w',
            html: true,
            title: function() {
                var d = this.__data__;
                return "Number of Check-ins: " + d.length;
            }
        });

    }
 });
}());