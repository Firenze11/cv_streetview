d3.csv('testDataCZ.csv', function (error, incidents) {

            function reformat(array) {
                var data = [];
                array.map(function (d, i) {

                    data.push({
                        id: i,
                        type: "Feature",
                        geometry: {
                            coordinates: [+d.longitude, +d.latitude],
                            type: "Point"
                        }                    
                    });
                });
                return data;
            }
            var geoData = { type: "FeatureCollection", features: reformat(incidents) };



            var qtree = d3.geom.quadtree(geoData.features.map(function (data, i) {
                return {
                    x: data.geometry.coordinates[0],
                    y: data.geometry.coordinates[1],
                    all: data
                };
            }
                                                         )
                                                  );


            // Find the nodes within the specified rectangle.
            function search(quadtree, x0, y0, x3, y3) {
                var pts = [];
                var subPixel = false;
                var subPts = [];
                var scale = getZoomScale();
                console.log(" scale: " + scale);
                var counter = 0;
                quadtree.visit(function (node, x1, y1, x2, y2) {
                    var p = node.point;
                    var pwidth = node.width * scale;
                    var pheight = node.height * scale;

                    // -- if this is too small rectangle only count the branch and set opacity
                    if ((pwidth * pheight) <= 1) {
                        // start collecting sub Pixel points
                        subPixel = true;
                    }
                        // -- jumped to super node large than 1 pixel
                    else {
                        // end collecting sub Pixel points
                        if (subPixel && subPts && subPts.length > 0) {

                            subPts[0].group = subPts.length;
                            pts.push(subPts[0]); // add only one todo calculate intensity
                            counter += subPts.length - 1;
                            subPts = [];
                        }
                        subPixel = false;
                    }

                    if ((p) && (p.x >= x0) && (p.x < x3) && (p.y >= y0) && (p.y < y3)) {

                        if (subPixel) {
                            subPts.push(p.all);
                        }
                        else {
                            if (p.all.group) {
                                delete (p.all.group);
                            }
                            pts.push(p.all);
                        }

                    }
                    // if quad rect is outside of the search rect do nto search in sub nodes (returns true)
                    return x1 >= x3 || y1 >= y3 || x2 < x0 || y2 < y0;
                });
                console.log(" Number of removed  points: " + counter);
                return pts;

            }

         
            function updateNodes(quadtree) {
                var nodes = [];
                quadtree.depth = 0; // root

                quadtree.visit(function (node, x1, y1, x2, y2) {
                    var nodeRect = {
                        left: MercatorXofLongitude(x1),
                        right: MercatorXofLongitude(x2),
                        bottom: MercatorYofLatitude(y1),
                        top: MercatorYofLatitude(y2),
                    }
                    node.width = (nodeRect.right - nodeRect.left);
                    node.height = (nodeRect.top - nodeRect.bottom);

                    if (node.depth == 0) {
                        console.log(" width: " + node.width + "height: " + node.height);
                    }
                    nodes.push(node);
                    for (var i = 0; i < 4; i++) {
                        if (node.nodes[i]) node.nodes[i].depth = node.depth + 1;
                    }
                });
                return nodes;
            }

            //-------------------------------------------------------------------------------------
            MercatorXofLongitude = function (lon) {
                return lon * 20037508.34 / 180;
            }

            MercatorYofLatitude = function (lat) {
                return (Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180;
            }
            var cscale = d3.scale.linear().domain([1, 3]).range(["#ff0000", "#ff6a00", "#ffd800", "#b6ff00", "#00ffff", "#0094ff"]);//"#00FF00","#FFA500"
            var leafletMap = L.map('map').setView([49.19, 16.60], 11);

            L.tileLayer("http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png").addTo(leafletMap);


            var svg = d3.select(leafletMap.getPanes().overlayPane).append("svg");
            var g = svg.append("g").attr("class", "leaflet-zoom-hide");


            // Use Leaflet to implement a D3 geometric transformation.
            function projectPoint(x, y) {
                var point = leafletMap.latLngToLayerPoint(new L.LatLng(y, x));
                this.stream.point(point.x, point.y);
            }

            var transform = d3.geo.transform({ point: projectPoint });
            var path = d3.geo.path().projection(transform);

            updateNodes(qtree);

            leafletMap.on('moveend', mapmove);

            mapmove();

            function getZoomScale() {
                var mapWidth = leafletMap.getSize().x;
                var bounds = leafletMap.getBounds();
                var planarWidth = MercatorXofLongitude(bounds.getEast()) - MercatorXofLongitude(bounds.getWest());
                var zoomScale = mapWidth / planarWidth;
                return zoomScale;
            }

            function redrawSubset(subset) {
                path.pointRadius(3);// * scale);

                var bounds = path.bounds({ type: "FeatureCollection", features: subset });
                var topLeft = bounds[0];
                var bottomRight = bounds[1];

                svg.attr("width", bottomRight[0] - topLeft[0])
                  .attr("height", bottomRight[1] - topLeft[1])
                  .style("left", topLeft[0] + "px")
                  .style("top", topLeft[1] + "px");

                g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

                var start = new Date();

                var points = g.selectAll("path")
                              .data(subset, function (d) {
                                  return d.id;
                              });
                points.enter().append("path");
                points.exit().remove();
                points.attr("d", path);

                points.style("fill-opacity", function (d) {
                    if (d.group) {
                        return (d.group * 0.1) + 0.2;
                    }
                });

                console.log("updated at  " + new Date().setTime(new Date().getTime() - start.getTime()) + " ms ");
            }
            function mapmove(e) {
                var mapBounds = leafletMap.getBounds();
                var subset = search(qtree, mapBounds.getWest(), mapBounds.getSouth(), mapBounds.getEast(), mapBounds.getNorth());
                console.log("subset: " + subset.length);

                redrawSubset(subset);
            }
        });