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
                v: Math.round(Math.min(87, 20 + Math.random()*(100 - rate.v)*2)*100)/100
            };
        });

        $scope.model.specialityIndex = index;
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
            calculateSuggestions();
        });

        function changeHandler(id){
            return function(sliderEvt) {
                metrics.setMetric(id, sliderEvt.newValue);
                $scope.model.suggestions = suggester.suggest(metrics.getData());
                $scope.model.specialityIndex = -1;
                $scope.metricSum = metrics.getSum();
                $scope.$apply();
                if(metrics.getSum() > 600) {
                    $('#chuck').show();
                } else {
                    $('#chuck').hide();
                }
            }
        }

        function calculateSuggestions() {
            $scope.model.suggestions = suggester.suggest(metrics.getData());
            $scope.model.specialityIndex = -1;
            $scope.metricSum = metrics.getSum();
        }
    }

    var metrics = {
        data:[60,30,20,0,0,0,0],
        setMetric: function(id, value)
        {
            this.data[id] = value;
        },

        getData: function() {
            return this.data;
        },

        getSum: function() {
            return this.data.reduce(function(previousValue, currentValue, index, array) {
                return previousValue + currentValue;
            });
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
            return res.slice(0,3);
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
            // var sizeScore = sizeScore(metrics, specialityMetrics);
            var sizeScore = Math.min(1, module(specialityMetrics)*1.0/module(metrics))*100;

            return Math.round(cosScore + sizeScore)/2;
        }
    };
});