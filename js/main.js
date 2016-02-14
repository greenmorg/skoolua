var app = angular.module('skool', []).controller('MainCtrl', function($scope, $http) {

    init();

    var self = this;
    $scope.model = {
        suggestions:[]
    };

    $scope.chooseSpeciality = function(index) {
        var univerRates = $scope.model.suggestions[index].univer_rates;
        $scope.model.univer_rates =  univerRates;
        $scope.model.enter_probs = univerRates.map(function(rate) {
            return {
                v: rate.enter_prob,
                color: rate.color
            };
        });
    }

    function init() {
        $('.skill-slider').slider();
        $('#skill-1').slider('on', 'change', changeHandler(0));
        $('#skill-2').slider('on', 'change', changeHandler(1));
        $('#skill-3').slider('on', 'change', changeHandler(2));
        $('#skill-4').slider('on', 'change', changeHandler(3));
        $('#skill-5').slider('on', 'change', changeHandler(4));
        $('#skill-6').slider('on', 'change', changeHandler(5));
        $('#skill-7').slider('on', 'change', changeHandler(6));

        $http.get('data/match-spec-data.json').then(function(res) {
           suggester.rawData = res.data;
        });

        function changeHandler(id){
            return function(sliderEvt) {
                metrics.setMetric(id, sliderEvt.newValue);
                $scope.model.suggestions = suggester.suggest(metrics.getData());
                $scope.$apply();
            }
        }
    }

    var metrics = {
        data:[0,0,0,0,0,0,0],
        setMetric: function(id, value)
        {
            this.data[id] = value;
        },

        getData: function() {
            return this.data;
        }
    };

    var suggester = {
        rawData:[],
        suggest: function(data) {
            var res = [];
            for(var i in this.rawData) {
                var rawDataItem = this.rawData[i];
                res.push({
                    sector: rawDataItem.sector,
                    speciality: rawDataItem.speciality_name,
                    score: this.calculateScore(rawDataItem.skill, data),
                    job_offers_volume: rawDataItem.vacancy_num,
                    average_revenue: rawDataItem.avg_rev,
                    job_offers_grow: rawDataItem.spros > 0,
                    average_revenue_grow: rawDataItem.avg_rev_grow,
                    univer_rates: rawDataItem.univerRates
                });
            }

            /*TODO: sort by salary and job offers*/
            res.sort(function(a,b){return b.score - a.score;});
            return res.slice(0,6);
        },

        calculateScore: function(metrics, specialityMetrics) {

            function module(vector) {
                var norm=0;
                for(var i in vector) {
                    norm += vector[i]*vector[i];
                }

                return Math.sqrt(norm);
            }

            function product(vector1, vector2) {
                var product=0;
                for(var i in vector1) {
                    product += vector1[i]*vector2[i];
                }

                return product;
            }

            function sizeScore(vector1, vector2) {
                var score = 0;
                for(var i in vector1) {
                    var metricDiff = vector1[i] - vector2[i];
                    if(metricDiff > 0) {
                        score += metricDiff;
                    }
                }

                return 100 - parseInt(score/7);
            }

            var cosScore =  parseInt((product(metrics, specialityMetrics)*1.0/(module(metrics)*module(specialityMetrics)))*100);
            var sizeScore = sizeScore(metrics, specialityMetrics);

            return (cosScore + sizeScore)/2;
        }
    };
});