(function() {
  'use strict';

  angular.module('skool').directive('percentHorizontalChart', function($window) {
    var transformData = function(data) {
      var offset = 0;
      return [{
        v: data.v,
        color: data.color,
        offset: offset
      }];
    };

    return {
      restrict: 'E',
      scope: {
        data: '=chartData'
      },
      link: function(scope, element) {
        var el = element[0];
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        var data = transformData(scope.data);
        var svg = $window.d3.select(el).append('svg')
          .attr('class', 'chart')
          .attr('width', width)
          .attr('height', height);

        var x = $window.d3.scale.linear()
          .domain([0, width])
          .rangeRound([0, width]);

        svg.selectAll('rect')
          .data(data)
          .enter().append('rect')
          .attr('class', 'bar')
          .attr('width', function(d) {
            return x(d.v * width / 100);
          })
          .style('fill', function(d, i) {
            return d.color || '#cccccc';
          })
          .attr('transform', function(d) {
            return 'translate(' + x(d.offset * width / 100) + ',0)';
          })
          .attr('height', height);

        svg.selectAll('text')
          .data(data)
          .enter().append('text')
          .attr('x', function(d) {
            return x((d.offset + d.v / 2) * width / 100);
          })
          .attr('y', 25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#fff')
          .text(function(d) {
            return $window.d3.round(d.v) + '%';
          });

      }
    };
  });

})();
