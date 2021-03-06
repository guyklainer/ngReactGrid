/** @jsx React.DOM */
/**
 * ngReactGridComponent - React Component
 **/
var ngReactGridComponent = (function() {

    var windowInnerWidth = window.innerWidth, windowInnerHeight = window.innerHeight;

    var setCellWidthPixels = function(cell) {

        var width = String(cell.width).replace("px", "");
        var isPercent = width.indexOf("%") !== -1;

        if(isPercent) {

            var widthInPixels = Math.floor((parseInt(width) * windowInnerWidth) / 100);
            cell.width = widthInPixels;

        }

    };

    var setCellWidth = function(grid, cell, cellStyle, isLast, bodyCell) {

        if(!cell.width) {
            cell.width = "10%";
        }

        if(grid.horizontalScroll) {
            setCellWidthPixels(cell);
        }

        cellStyle.width = cell.width;
    };

    var ngReactGridHeader = (function() {

        // For input in header. Expandable to additional types.
        var ngGridHeaderCellInput = React.createClass({displayName: 'ngGridHeaderCellInput',
            getInitialState: function() {
                return {
                    checked: false
                };
            },
            setNgReactGridCheckboxHeaderStateFromEvent: function(e) {
                this.setState({
                    checked: e.detail.checked
                });
            },
            componentDidMount: function() {
                window.addEventListener("setNgReactGridCheckboxHeaderStateFromEvent", this.setNgReactGridCheckboxHeaderStateFromEvent);
            },
            componentWillUnmount: function() {
                window.removeEventListener("setNgReactGridCheckboxHeaderStateFromEvent", this.setNgReactGridCheckboxHeaderStateFromEvent);
            },
            handleCheckboxClick: function() {
                var newCheckedValue = (this.state.checked) ? false : true;
                this.props.cell.handleHeaderClick(newCheckedValue, this.props.grid.react.getFilteredAndSortedData());
                this.setState({
                    checked: newCheckedValue
                });
            },
            render: function() {
                var headerStyle = this.props.cell.options ?
                        (this.props.cell.options.headerStyle || {}) : {};
                if (this.props.cell.inputType !== undefined) {
                    switch (this.props.cell.inputType) {
                        case "checkbox":
                            return (
                                React.DOM.div( {title:this.props.cell.title, className:"ngGridHeaderCellCheckboxInput", style:headerStyle}, 
                                    React.DOM.input( {type:this.props.cell.inputType, onChange:this.handleCheckboxClick, checked:this.state.checked})
                                )
                            );
                            break;
                        default:
                            return (React.DOM.div(null));
                    }
                } else {
                    return (React.DOM.div(null));
                }
            }
        });

        var ngGridHeaderCell = React.createClass({displayName: 'ngGridHeaderCell',
            getInitialState: function() {
                return {
                    width: 0
                };
            },
            cellStyle: {},
            handleClick: function() {
                if (this.props.cell.sort !== false) {
                    this.props.grid.react.setSortField(this.props.cell.field);
                }
            },
            componentWillReceiveProps: function() {
                setCellWidth(this.props.grid, this.props.cell, this.cellStyle, this.props.last);
                this.setState({
                    width: this.cellStyle.width
                });
            },
            componentWillMount: function() {
                setCellWidth(this.props.grid, this.props.cell, this.cellStyle, this.props.last);
                this.setState({
                    width: this.cellStyle.width
                });
            },
            resize: function(delta) {
                // resize functionality coming soon
            },
            componentDidMount: function() {
                // resize functionality coming soon
            },
            render: function() {
                this.cellStyle.cursor = (this.props.cell.sort !== false) ? "pointer" : "default";
                var cellStyle = this.cellStyle;

                var sortStyle = {
                    cursor: "pointer",
                    width: "8%",
                    "float": "left",
                    textAlign: "right",
                    display: (this.props.cell.sort === false) ? "none": "inline-block",
                    overflow: "visible"
                };

                var arrowStyle = {
                    marginTop: 2
                };

                var sortClassName = "icon-arrows";

                if(this.props.grid.sortInfo.field === this.props.cell.field) {
                    if(this.props.grid.sortInfo.dir === "asc") {
                        sortClassName += " icon-asc";
                    } else {
                        sortClassName += " icon-desc";
                    }

                    arrowStyle.marginTop = 5;
                } else {
                    sortClassName += " icon-both";
                }

                var resizeStyle = {
                    height: "21px",
                    marginTop: "-4px",
                    width: "1px",
                    background: "#999999",
                    borderRight: "1px solid #FFF",
                    "float": "right"
                };

                var resizeWrapperStyle = {
                    width: "2%",
                    cursor: "col-resize",
                    display: "none"
                };

                return (
                    React.DOM.th( {title:this.props.cell.displayName, onClick:this.handleClick, style:cellStyle}, 
                        React.DOM.div( {className:"ngGridHeaderCellText"}, 
                            this.props.cell.displayName
                        ),
                        ngGridHeaderCellInput( {cell:this.props.cell, grid:this.props.grid} ),
                        React.DOM.div( {style:sortStyle} , React.DOM.i( {className:sortClassName, style:arrowStyle})),
                        React.DOM.div( {style:resizeWrapperStyle, className:"ngGridHeaderResizeControl"}, 
                            React.DOM.div( {className:"ngGridHeaderCellResize", style:resizeStyle})
                        )
                    )
                )
            }
        });

        var ngReactGridSearch = React.createClass({displayName: 'ngReactGridSearch',
            handleSearch: function() {
                this.props.grid.react.setSearch(this.refs.searchField.getDOMNode().value);
            },
            render: function() {
                if (this.props.grid.showGridSearch) {
                  return (
                      React.DOM.div( {className:"ngReactGridSearch"}, 
                          React.DOM.input( {type:"input", placeholder:"Search...", ref:"searchField", onKeyUp:this.handleSearch} )
                      )
                  )
                } else {
                  return (React.DOM.div(null))
                }
            }
        });

        var ngReactGridHeader = React.createClass({displayName: 'ngReactGridHeader',
            render: function() {

                var columnsLength = this.props.grid.columnDefs.length;
                var cells = this.props.grid.columnDefs.map(function(cell, key) {
                    var last = (columnsLength - 1) === key;
                    return (ngGridHeaderCell( {key:key, cell:cell, index:key, grid:this.props.grid, last:last} ))
                }.bind(this));

                var tableStyle = {
                    width: "calc(100% - " + this.props.grid.scrollbarWidth + "px)"
                };

                var ngReactGridHeader = {
                    paddingRight: (this.props.grid.horizontalScroll) ? this.props.grid.scrollbarWidth : 0
                };

                return (
                    React.DOM.div(null, 
                        React.DOM.div( {className:"ngReactGridHeaderToolbarWrapper"}, 
                            ngReactGridSearch( {grid:this.props.grid} )
                        ),
                        React.DOM.div( {className:"ngReactGridHeaderWrapper"}, 
                            React.DOM.div( {className:"ngReactGridHeader", style:ngReactGridHeader}, 
                                React.DOM.div( {className:"ngReactGridHeaderInner"}, 
                                    React.DOM.table( {style:tableStyle}, 
                                        React.DOM.thead(null, 
                                            React.DOM.tr(null, 
                                                cells
                                            )
                                        )
                                    )
                                )
                            )
                        )
                    )
                );
            }
        });

        return ngReactGridHeader;
    })();

    var ngReactGridBody = (function() {

        var ngReactGridBodyRowCell = React.createClass({displayName: 'ngReactGridBodyRowCell',
            cell: function(cellText, cellStyle) {
                var cellTextType    = typeof cellText,
                    self            = this;

                cellStyle           = Object.create( cellStyle );

                if( this.props.cell.style )
                    Object.keys( this.props.cell.style ).map( function (prop){
                        cellStyle[prop] = self.props.cell.style[prop];
                    });

                if(cellTextType === 'string') {
                    return (React.DOM.td( {style:cellStyle, className:this.props.cell.className}, cellText))
                } else if(cellTextType === 'object') {

                    cellText = this.props.grid.react.wrapFunctionsInAngular(cellText);

                    return (
                        React.DOM.td( {style:cellStyle, className:this.props.cell.className}, 
                            cellText
                        )
                    );
                } else {
                    return this.defaultCell;
                }
            },
            render: function() {
                var cellText = this.props.grid.react.getObjectPropertyByString(this.props.row, this.props.cell.field);
                var cellStyle = {};
                setCellWidth(this.props.grid, this.props.cell, cellStyle, this.props.last, true);

                if(this.props.grid.singleLineCell) {
                    cellStyle.overflow = "hidden";
                    cellStyle.textOverflow = "ellipsis";
                    cellStyle.whiteSpace = "nowrap";
                }

                this.defaultCell = (
                        React.DOM.td( {style:cellStyle, title:cellText}, 
                            React.DOM.div(null, cellText)
                        )
                    );

                if(this.props.grid.editing && this.props.cell.edit) {
                    cellText = this.props.cell.edit(this.props.row);
                    return this.cell(cellText, cellStyle);
                } else if(this.props.cell.render) {
                    cellText = this.props.cell.render(this.props.row);
                    return this.cell(cellText, cellStyle);
                } else {
                    return this.defaultCell;
                }


            }
        });

        var ngReactGridBodyRow = React.createClass({displayName: 'ngReactGridBodyRow',
            handleClick: function() {
                this.props.grid.react.rowClick(this.props.row);
            },
            render: function() {

                var columnsLength = this.props.grid.columnDefs.length;
                var cells = this.props.grid.columnDefs.map(function(cell, key) {
                    var last = (columnsLength - 1) === key;
                    return ngReactGridBodyRowCell( {key:key, cell:cell, row:this.props.row, grid:this.props.grid, last:last} )
                }.bind(this));

                return (
                    React.DOM.tr( {onClick:this.handleClick}, 
                        cells
                    )
                )
            }
        });


        var ngReactGridBody = React.createClass({displayName: 'ngReactGridBody',
            getInitialState: function() {
                return {
                    fullRender: false,
                    needsUpdate: false
                }
            },
            calculateIfNeedsUpdate: function() {
                if(this.props.grid.data.length > 100) {
                    this.setState({
                        needsUpdate: true
                    });
                }
            },
            performFullRender: function() {
                if(this.state.needsUpdate) {
                    setTimeout(function() {
                        this.setState({
                            fullRender: true,
                            needsUpdate: false
                        });
                    }.bind(this), 0);
                }
            },
            componentWillMount: function() {
                this.calculateIfNeedsUpdate();
            },
            componentWillReceiveProps: function() {
                this.calculateIfNeedsUpdate();
            },
            componentDidMount: function() {
                var domNode = this.getDOMNode();
                var header = document.querySelector(".ngReactGridHeaderInner");
                var viewPort = document.querySelector(".ngReactGridViewPort");

                domNode.firstChild.addEventListener('scroll', function(e) {
                    header.scrollLeft = viewPort.scrollLeft;
                });

                this.performFullRender();
            },
            componentDidUpdate: function() {
                this.performFullRender();
            },
            render: function() {

                var mapRows = function(row, index) {
                    return ngReactGridBodyRow( {key:index, row:row, columns:this.props.columnDefs, grid:this.props.grid} )
                }.bind(this);

                var rows,total;

                if(this.props.grid.react.loading) {

                    var loadingStyle = {
                        textAlign: "center"
                    };

                    rows = (
                        React.DOM.tr(null, 
                            React.DOM.td( {colSpan:this.props.grid.columnDefs.length, style:loadingStyle}, 
                                "Loading..."
                            )
                        )
                    )
                } else {
                    if(!this.state.fullRender) {
                        rows = this.props.grid.data.slice(0, 100).map(mapRows);
                    } else {
                        rows = this.props.grid.data.map(mapRows);
                    }

                    if(this.props.grid.react.showingRecords === 0) {
                        var noDataStyle = {
                            textAlign: "center"
                        };

                        rows = (
                            React.DOM.tr(null, 
                                React.DOM.td( {colSpan:this.props.grid.columnDefs.length, style:noDataStyle}, 
                                    "No records found"
                                )
                            )
                        )
                    } else {
                        if( this.props.grid.total ){
                            total = rows.pop();
                            total.props.row.isTotal = true;
                        }
                    }
                }


                var ngReactGridViewPortStyle = {
                    maxHeight: this.props.grid.height,
                    minHeight: this.props.grid.height
                };

                var tableStyle = {};

                if(!this.props.grid.horizontalScroll) {
                    ngReactGridViewPortStyle.overflowX = "hidden";
                } else {
                    tableStyle.width = "calc(100% - " + this.props.grid.scrollbarWidth + "px)";
                }

                if( total )
                    total = (
                        React.DOM.table( {className:"total-row", style:tableStyle}, 
                            React.DOM.tbody(null, 
                                total
                            )
                        )
                    );

                return (
                    React.DOM.div( {className:"ngReactGridBody"}, 
                        React.DOM.div( {className:"ngReactGridViewPort", style:ngReactGridViewPortStyle}, 
                            React.DOM.div( {className:"ngReactGridInnerViewPort"}, 
                                React.DOM.table( {style:tableStyle}, 
                                    React.DOM.tbody(null, 
                                        rows
                                    )
                                )
                            )
                        ),
                        total
                    )
                );
            }
        });

        return ngReactGridBody;
    })();

    var ngReactGridFooter = (function() {

        var ngReactGridStatus = React.createClass({displayName: 'ngReactGridStatus',
            render: function() {

                return (
                    React.DOM.div( {className:"ngReactGridStatus"}, 
                        React.DOM.div(null, "Page ", React.DOM.strong(null, this.props.grid.currentPage), " of ", React.DOM.strong(null, this.props.grid.totalPages), " - Showing ", React.DOM.strong(null, this.props.grid.react.showingRecords), " of ", React.DOM.strong(null, this.props.grid.totalCount), " records")
                    )
                )
            }
        });

        var ngReactGridShowPerPage = React.createClass({displayName: 'ngReactGridShowPerPage',
            handleChange: function() {
                this.props.grid.react.setPageSize(this.refs.showPerPage.getDOMNode().value);
            },
            render: function() {

                var options = this.props.grid.pageSizes.map(function(pageSize, key) {
                    return (React.DOM.option( {value:pageSize, key:key}, pageSize))
                }.bind(this));

                if (this.props.grid.showGridShowPerPage) {
                    return (
                        React.DOM.div( {className:"ngReactGridShowPerPage"}, 
                        "Show ", React.DOM.select( {onChange:this.handleChange, ref:"showPerPage", value:this.props.grid.pageSize}, options), " entries"
                        )
                    )
                } else {
                    return (React.DOM.div(null))
                }
            }
        });

        var ngReactGridPagination = React.createClass({displayName: 'ngReactGridPagination',
            goToPage: function(page) {
                this.props.grid.react.goToPage(page);
            },
            goToLastPage: function() {
                this.goToPage(this.props.grid.totalPages);
            },
            goToFirstPage: function() {
                this.goToPage(1);
            },
            goToNextPage: function() {
                var nextPage = (this.props.grid.currentPage + 1);
                var diff = this.props.grid.totalPages - nextPage;

                if(diff >= 0) {
                    this.goToPage(nextPage);
                }
            },
            goToPrevPage: function() {
                var prevPage = (this.props.grid.currentPage - 1);
                if(prevPage > 0) {
                    this.goToPage(prevPage);
                }
            },
            render: function() {

                var pagerNum = 2;
                var totalPages = this.props.grid.totalPages;
                var currentPage = this.props.grid.currentPage;
                var indexStart = (currentPage - pagerNum) <= 0 ? 1 : (currentPage - pagerNum);
                var indexFinish = (currentPage + pagerNum) >= totalPages ? totalPages : (currentPage + pagerNum);
                var pages = [];

                for(var i = indexStart; i <= indexFinish; i++) {
                    pages.push(i);
                }

                pages = pages.map(function(page, key) {
                    var pageClass = (page === this.props.grid.currentPage) ? "active" : "";
                    return React.DOM.li( {key:key, className:pageClass, dataPage:page}, React.DOM.a( {href:"javascript:", onClick:this.goToPage.bind(null, page)}, page));
                }.bind(this));

                return (
                    React.DOM.div( {className:"ngReactGridPagination"}, 
                        React.DOM.ul(null, 
                            React.DOM.li(null, React.DOM.a( {href:"javascript:", onClick:this.goToFirstPage}, "First")),
                            React.DOM.li(null, React.DOM.a( {href:"javascript:", onClick:this.goToPrevPage}, "Prev")),
                            pages,
                            React.DOM.li(null, React.DOM.a( {href:"javascript:", onClick:this.goToNextPage}, "Next")),
                            React.DOM.li(null, React.DOM.a( {href:"javascript:", onClick:this.goToLastPage}, "Last"))
                        )
                    )
                )
            }
        });

        var ngReactGridFooter = React.createClass({displayName: 'ngReactGridFooter',
            render: function() {
                return (
                    React.DOM.div( {className:"ngReactGridFooter"}, 
                        ngReactGridStatus( {grid:this.props.grid} ),
                        ngReactGridShowPerPage( {grid:this.props.grid, setGridState:this.props.setGridState} ),
                        ngReactGridPagination( {grid:this.props.grid} )
                    )
                )
            }
        });

        return ngReactGridFooter;
    })();

    var ngReactGrid = React.createClass({displayName: 'ngReactGrid',
        render: function() {
            return (
                React.DOM.div( {className:"ngReactGrid"}, 
                    ngReactGridHeader( {grid:this.props.grid} ),
                    ngReactGridBody( {grid:this.props.grid} ),
                    ngReactGridFooter( {grid:this.props.grid} )
                )
            )
        }
    });

    return ngReactGrid;
})();

/** @jsx React.DOM */
var ngReactGridCheckboxComponent = (function() {
    var ngReactGridCheckboxComponent = React.createClass({displayName: 'ngReactGridCheckboxComponent',
        getInitialState: function() {
            var disableCheckboxField = this.props.options.disableCheckboxField;
            var disableCheckboxFieldValue = this.props.options.getObjectPropertyByStringFn(this.props.row, disableCheckboxField);
            return {
                checked: false,
                disabled: disableCheckboxFieldValue ? disableCheckboxFieldValue : false
            }
        },

        handleClick: function() {
            this.setState({
                checked: this.state.checked ? false : true
            });

            this.props.handleClick();
        },
        setNgReactGridCheckboxStateFromEvent: function(event) {
            if (!this.state.disabled) {
                this.setState({
                    checked: event.detail.checked
                });
            }
        },
        componentWillReceiveProps: function(nextProps) {
            var disableCheckboxField = nextProps.options.disableCheckboxField;
            var disableCheckboxFieldValue = nextProps.options.getObjectPropertyByStringFn(nextProps.row, disableCheckboxField);
            this.setState({
                checked: (nextProps.selectionTarget.indexOf(nextProps.row) === -1) ? false : true,
                disabled: disableCheckboxFieldValue ? disableCheckboxFieldValue : false
            });
        },
        componentDidMount: function() {
            window.addEventListener("setNgReactGridCheckboxStateFromEvent", this.setNgReactGridCheckboxStateFromEvent);
        },
        componentWillUnmount: function() {
            window.removeEventListener("setNgReactGridCheckboxStateFromEvent", this.setNgReactGridCheckboxStateFromEvent);
        },
        render: function() {
            var hideDisabledCheckboxField = this.props.options.hideDisabledCheckboxField;

            if (this.state.disabled && hideDisabledCheckboxField) {
              return (
                    React.DOM.div( {style:this.props.options.headerStyle} )
              )
            } else {
                return (
                    React.DOM.div( {style:this.props.options.headerStyle}, 
                        React.DOM.input( {type:"checkbox", onChange:this.handleClick, checked:this.state.checked, disabled:this.state.disabled} )
                    )
                )
            }
        }
    });

    return ngReactGridCheckboxComponent;
})();

/** @jsx React.DOM */
var ngReactGridCheckboxFieldComponent = (function() {
    var ngReactGridCheckboxFieldComponent = React.createClass({displayName: 'ngReactGridCheckboxFieldComponent',
        getInitialState: function() {
            return {
                checked: false
            }
        },
        handleClick: function() {
            var newState = {
                checked: (this.state.checked) ? false : true
            };

            this.setState(newState);

            this.props.updateValue(newState.checked);
        },
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                checked: (nextProps.value) ? true : false
            });
        },
        componentWillMount: function() {
            this.setState({
                checked: (this.props.value === true) ? true : false
            });
        },
        render: function() {
            return (
                React.DOM.input( {type:"checkbox", checked:this.state.checked, onChange:this.handleClick} )
            )
        }
    });

    return ngReactGridCheckboxFieldComponent;
})();
/** @jsx React.DOM */
var ngReactGridSelectFieldComponent = (function() {

    var ngReactGridSelectFieldComponent = React.createClass({displayName: 'ngReactGridSelectFieldComponent',
        getInitialState: function() {
            return {
                defaultValue: {
                    id: "",
                    name: ""
                }
            };
        },
        handleChange: function(e) {
            var value = e.target.value;
            this.props.updateValue(value);
            this.setState({
                defaultValue: {
                    id: value
                }
            });
        },
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                defaultValue: nextProps.value || {}
            });
        },
        componentWillMount: function() {
            this.setState({
                defaultValue: this.props.value || {}
            });
        },
        render: function() {

            if(!this.props.referenceData) {
                this.props.referenceData = [];
            }

            var options = this.props.referenceData.map(function(option) {
                return (
                    React.DOM.option( {value:option.id}, option.name)
                )
            });
        
            return (
                React.DOM.select( {className:"ngReactGridSelectField", value:this.state.defaultValue.id, onChange:this.handleChange}, 
                    options
                )
            )
        }
    });

    return ngReactGridSelectFieldComponent;

})();
/** @jsx React.DOM */
var ngReactGridTextFieldComponent = (function() {
    var ngReactGridTextFieldComponent = React.createClass({displayName: 'ngReactGridTextFieldComponent',
        getInitialState: function() {
            return {
                defaultValue: ""
            };
        },
        handleChange: function() {
            var value = this.refs.textField.getDOMNode().value;
            this.props.updateValue(value);
            this.setState({
                defaultValue: value
            });
        },
        componentWillReceiveProps: function(nextProps) {
            this.setState({
                defaultValue: nextProps.value
            });
        },
        componentWillMount: function() {
            this.setState({
                defaultValue: this.props.value
            });
        },
        render: function() {
            return (
                React.DOM.input( {type:"text", value:this.state.defaultValue, className:"ngReactTextField", ref:"textField", onChange:this.handleChange} )
            )
        }
    });

    return ngReactGridTextFieldComponent;
})();
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _ = require('../vendors/miniUnderscore');
var NgReactGridReactManager = require("./NgReactGridReactManager");
var NgReactGridEditManager = require("./NgReactGridEditManager");
var NO_GET_DATA_CALLBACK_ERROR = "localMode is false, please implement the getData function on the grid object";

/**
 * NgReactGrid - Main class
 * @param scope
 * @param element
 * @param attrs
 * @param $rootScope
 * @constructor
 */
var NgReactGrid = function (scope, element, attrs, $rootScope) {
    this.columnDefs = scope.grid.columnDefs || [];
    this.data = [];
    this.height = 500;
    this.localMode = true;
    this.editing = false;
    this.singleLineCell = false;
    this.totalCount = 0;
    this.totalPages = 0;
    this.currentPage = 1;
    this.rowClick = function() {};
    this.pageSize = 25;
    this.pageSizes = [25, 50, 100, 500];
    this.sortInfo = {field: "", dir: ""};
    this.showGridSearch = false;
    this.showGridShowPerPage = true;
    this.search = "";
    this.horizontalScroll = false;
    this.scrollbarWidth = this.getScrollbarWidth();
    this.scope = scope;
    this.element = element;
    this.attrs = attrs;
    this.rootScope = $rootScope;

    /**
     * Initialize the NgReactGridReact class
     */
    this.react = new NgReactGridReactManager(this);
    this.editManager = new NgReactGridEditManager(this);

    /**
     * Initialize events
     */
    this.setupUpdateEvents();

    /**
     * Initialize scope watchers
     */
    this.initWatchers();

    /**
     * Init the grid
     */
    this.init();
};

/**
 * Init function for NgReactGrid, decides whether to getData or render with local data
 */
NgReactGrid.prototype.init = function () {

    /**
     * Check if getData is set, override with our own and keep a private copy
     */
    if (typeof this.scope.grid.localMode && this.scope.grid.localMode === false) {
        if (this.scope.grid.getData) {
            this._getData = this.scope.grid.getData;
            delete this.scope.grid.getData;
        } else {
            throw new Error(NO_GET_DATA_CALLBACK_ERROR);
        }
    }

    _.extend(this, this.scope.grid);

    /**
     * Provide API interfaces
     */
    this.react.mixinAPI(this.scope.grid);
    this.editManager.mixinAPI(this.scope.grid);

    /**
     * If we are in server mode, perform the first call to load the data, and add refresh API
     */
    if (this.isServerMode()) {
        this.getData();
        this.addRefreshAPI();
    } else {
        this.updateData({
            data: this.data
        });
    }

    this.render();

};

/**
 * Get data wrapper, at the moment it doesn't do much but expect some hooks and functionality being added in the future
 */
NgReactGrid.prototype.getData = function () {
    this.react.loading = true;
    this._getData(this);
    this.render();
};

/**
 * This function mixes in the "refresh" API method that can be used in server mode grids.
 */
NgReactGrid.prototype.addRefreshAPI = function () {
    var self = this;

    this.scope.grid.refresh = function () {
        self.getData.call(self);
    };
};

/**
 * This is called once during initialization to figure out the width of the scrollbars
 * @returns {number}
 */
NgReactGrid.prototype.getScrollbarWidth = function () {
    var outer = document.createElement("div");
    outer.style.visibility = "hidden";
    outer.style.width = "100px";

    /**
     * Needed for WinJS apps
     * @type {string}
     */
    outer.style.msOverflowStyle = "scrollbar";

    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;

    /*
     * Force scroll bars
     */
    outer.style.overflow = "scroll";

    /*
     * Add innerDiv
     */
    var inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;

    /**
     * Remove divs
     */
    outer.parentNode.removeChild(outer);

    return widthNoScroll - widthWithScroll;
};

/**
 * Returns whether there is an active search on the grid
 * @returns {string|boolean}
 */
NgReactGrid.prototype.isSearching = function () {
    return this.search && this.search.length > 0;
};

/**
 * Returns whether the grid is in local mode
 * @returns {boolean|*}
 */
NgReactGrid.prototype.isLocalMode = function () {
    return this.localMode;
};

/**
 * Returns whether the grid is in server mode
 * @returns {boolean}
 */
NgReactGrid.prototype.isServerMode = function () {
    return !this.localMode;
};

/**
 * Manages the different events that can update the grid
 */
NgReactGrid.prototype.setupUpdateEvents = function () {
    this.events = {
        PAGESIZE: "PAGESIZE",
        SORTING: "SORTING",
        SEARCH: "SEARCH",
        PAGINATION: "PAGINATION",
        DATA: "DATA",
        TOTALCOUNT: "TOTALCOUNT",
        COLUMNS: "COLUMNS"
    };
};

/**
 * Initializes the scope watchers needed for the grid
 */
NgReactGrid.prototype.initWatchers = function () {
    this.scope.$watch("grid.data", function (newValue, oldValue) {
        if (newValue !== oldValue) {
            if (this.isServerMode() && this.react.loading) {
                this.react.loading = false;
            }

            this.update(this.events.DATA, {
                data: newValue
            });
        }
    }.bind(this));

    this.scope.$watch("grid.totalCount", function (newValue) {
        if (newValue) {
            this.update(this.events.TOTALCOUNT, {totalCount: newValue});
        }
    }.bind(this));

    this.scope.$watch("grid.search", function (newValue, oldValue) {
        if (newValue !== oldValue)
            this.react.setSearch(newValue);
    }.bind(this));

    this.scope.$watch("grid.columnDefs", function (newValue ,oldValue) {
        if (newValue && newValue !== oldValue) {
            this.update(this.events.COLUMNS, {columnDefs: newValue});
        }
    }.bind(this));
};

/**
 * Updates the grid model, re-renders the react component
 * @param updateEvent
 * @param updates
 */
NgReactGrid.prototype.update = function (updateEvent, updates) {
    switch (updateEvent) {
        case this.events.DATA:
            this.updateData(updates);
            break;

        case this.events.PAGESIZE:
            this.updatePageSize(updates);
            break;

        case this.events.PAGINATION:
            this.updatePagination(updates);
            break;

        case this.events.SEARCH:
            this.updateSearch(updates);
            break;

        case this.events.SORTING:
            this.updateSorting(updates);
            break;

        case this.events.TOTALCOUNT:
            this.updateTotalCount(updates);
            break;

        case this.events.COLUMNS:
            this.updateColumns(updates);
            break;
    }

    this.render();

};

/**
 * This function takes care of updating all data related properties. The second param will not the update the originalData
 * property in the react manager
 * @param updates
 * @param updateContainsData
 */
NgReactGrid.prototype.updateData = function (updates, updateContainsData) {

    this.react.startIndex = (this.currentPage - 1) * this.pageSize;
    this.react.endIndex = (this.pageSize * this.currentPage);

    if (this.isLocalMode()) {
        if (updateContainsData) {

            this.data = updates.data.slice(this.react.startIndex, this.react.endIndex);
            this.react.filteredAndSortedData = updates.data.slice(0);
            this.totalCount = updates.data.length;

        } else {
            this.react.originalData = updates.data.slice(0);
            this.totalCount = this.react.originalData.length;
            this.data = this.react.originalData.slice(this.react.startIndex, this.react.endIndex);
            this.react.filteredAndSortedData = this.react.originalData.slice(0);
        }

    } else {
        this.data = updates.data;
        this.react.filteredAndSortedData = this.data.slice(0);
    }

    this.react.showingRecords = this.data.length;

    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
};

/**
 * This function updates the necessary properties for a successful page size update
 * @param updates
 */
NgReactGrid.prototype.updatePageSize = function (updates) {
    this.pageSize = updates.pageSize;
    this.currentPage = updates.currentPage;
    this.updateData({
        data: this.react.filteredAndSortedData ? this.react.filteredAndSortedData : this.react.originalData
    }, true);
};

/**
 * This function updates the necessary properties for a successful pagination update
 * @param updates
 */
NgReactGrid.prototype.updatePagination = function (updates) {
    this.currentPage = updates.currentPage;
    this.updateData({
        data: this.react.filteredAndSortedData ? this.react.filteredAndSortedData : this.react.originalData
    }, true);
};

/**
 * This function updates the necessary properties for a successful search update
 * @param updates
 */
NgReactGrid.prototype.updateSearch = function (updates) {
    this.search = updates.search;
    this.currentPage = 1;
    this.updateData({
        data: updates.data
    }, true);
};

/**
 * This function updates the necessary properties for a successful sorting update
 * @param updates
 */
NgReactGrid.prototype.updateSorting = function (updates) {
    this.sortInfo = updates.sortInfo;

    if (updates.data) {
        this.currentPage = 1;
        this.updateData({
            data: updates.data
        }, true);
    }
};

/**
 * This function updates the necessary properties for a successful total count update
 * @param updates
 */
NgReactGrid.prototype.updateTotalCount = function (updates) {
    this.totalCount = updates.totalCount;
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
};

/**
 * This function updates requested visible columns ( columnDefs object )
 * @param updates
 */
NgReactGrid.prototype.updateColumns = function (updates) {
    this.columnDefs = updates.columnDefs;
};

/**
 * Calls React to render the grid component on the given element
 */
NgReactGrid.prototype.render = function () {
    React.renderComponent(ngReactGridComponent({grid: this}), this.element[0]);
};

module.exports = NgReactGrid;

},{"../vendors/miniUnderscore":10,"./NgReactGridEditManager":2,"./NgReactGridReactManager":3}],2:[function(require,module,exports){
/**
 * This class manages the editing/saving/reverting functionality to ngReactGrid
 * @param ngReactGrid
 * @constructor
 */
var NgReactGridEditManager = function(ngReactGrid) {
    this.ngReactGrid = ngReactGrid;
    this.dataCopy = [];
};

/**
 * This function is used to add the edit/save/cancel API to the grid object created by the user.
 * @param gridObject
 */
NgReactGridEditManager.prototype.mixinAPI = function(gridObject) {
    var self = this;

    /**
     * This is the function that puts the grid into edit mode
     */
    gridObject.edit = function() {
        return self.edit.call(self);
    };

    /**
     * This is the function that will persist the modified data to the original model
     */
    gridObject.save = function() {
        return self.save.call(self);
    };

    /**
     * This function is called whenever the modifications need to be reverted
     */
    gridObject.cancel = function() {
        return self.cancel.call(self);
    };

    /**
     * This function is called whenever the modifications need to be reverted
     */
    gridObject.getEditedData = function() {
        return self.getEditedData.call(self);
    };

};

/**
 * This is the function that puts the grid into edit mode
 */
NgReactGridEditManager.prototype.getEditedData = function() {
    return this.ngReactGrid.react.originalData;
};

/**
 * This is the function that puts the grid into edit mode
 */
NgReactGridEditManager.prototype.edit = function() {
    this.ngReactGrid.editing = true;
    this.dataCopy = this.copyData(this.ngReactGrid.react.originalData);
    this.ngReactGrid.render();
};

/**
 * This is the function that will persist the modified data to the original model
 */
NgReactGridEditManager.prototype.save = function() {
    this.ngReactGrid.editing = false;

    this.ngReactGrid.update(this.ngReactGrid.events.DATA, {
        data: this.ngReactGrid.react.originalData
    });

    return this.ngReactGrid.react.originalData;
};

/**
 * This function is called whenever the modifications need to be reverted
 */
NgReactGridEditManager.prototype.cancel = function() {
    this.ngReactGrid.editing = false;

    this.ngReactGrid.update(this.ngReactGrid.events.DATA, {
        data: this.dataCopy
    });
};

NgReactGridEditManager.prototype.copyData = function(data) {
    return JSON.parse(JSON.stringify(data));
};

module.exports = NgReactGridEditManager;
},{}],3:[function(require,module,exports){
/**
 * This class is the bridge between the ngReactGrid class and React
 * @param ngReactGrid
 * @constructor
 */
var NgReactGridReactManager = function (ngReactGrid) {
    /**
     * Reference to the ngReactGrid main class
     */
    this.ngReactGrid = ngReactGrid;

    /**
     * How many records we are currently showing with filters, search, pageSize and pagination applied
     * @type {number}
     */
    this.showingRecords = 0;

    /**
     * The starting index by which we are filtering the local data
     * @type {number}
     */
    this.startIndex = 0;

    /**
     * The end index by which we are filtering local data
     * @type {number}
     */
    this.endIndex = 0;

    /**
     * This is a copy of the data given to ngReactGrid (local data only)
     * @type {Array}
     */
    this.originalData = [];

    /**
     * This is a copy of the data given to ngReactGrid whenever it is filtered (local data only)
     * @type {Array}
     */
    this.filteredData = [];

    /**
     * This is a copy of the pagination-independent viewable data in table that
     *     can be affected by filter and sort
     * @type {Array}
     */
    this.filteredAndSortedData = [];

    /**
     * Loading indicator
     * @type {boolean}
     */
    this.loading = false;

    /**
     * Instance pointer to a static function
     * @type {Function}
     */
    this.getObjectPropertyByString = NgReactGridReactManager.getObjectPropertyByString;
};

/**
 * This function is used to add API to the grid object created by the user.
 * @param gridObject
 */
NgReactGridReactManager.prototype.mixinAPI = function(gridObject) {
    var self = this;

    /**
     * Get filtered and sorted data
     */
    gridObject.getFilteredAndSortedData = function() {
        return self.getFilteredAndSortedData.call(self);
    };
};

/**
 * Get table data wrapper
 */
NgReactGridReactManager.prototype.getFilteredAndSortedData = function() {
    return this.filteredAndSortedData;
};

/**
 * Page size setter, this is called for the ngReactGridComponent (React class)
 * @param pageSize
 */
NgReactGridReactManager.prototype.setPageSize = function (pageSize) {

    var update = {
        pageSize: pageSize,
        currentPage: 1
    };

    /*
     * Is there a search in place
     */
    if (this.ngReactGrid.isSearching()) {
        update.data = this.filteredData;
    }

    /**
     * Send the update event to the main class
     */
    this.ngReactGrid.update(this.ngReactGrid.events.PAGESIZE, update);

    /**
     * If we are in server mode, call getData
     */
    if (this.ngReactGrid.isServerMode()) {
        this.ngReactGrid.getData();
    }
};

/**
 * Sorting callback, this is called from the ngReactGridComponent whenever a header cell is clicked (and is sortable)
 * @param field
 */
NgReactGridReactManager.prototype.setSortField = function (field) {

    /**
     * The initial update to the grid
     * @type {{sortInfo: {field: string, dir: string}}}
     */
    var update = {
        sortInfo: {
            field: field,
            dir: ""
        }
    };

    /**
     * Are we sorting on a new field
     */
    if (this.ngReactGrid.sortInfo.field !== field) {
        update.sortInfo.dir = "asc";
    } else {
        /**
         * Switch the sorting direction
         */
        if (this.ngReactGrid.sortInfo.dir === "asc") {
            update.sortInfo.dir = "desc";
        } else {
            update.sortInfo.dir = "asc";
        }

    }

    /**
     * Call getData for Server Mode or perform a local sort
     */
    if (this.ngReactGrid.isServerMode()) {
        this.ngReactGrid.update(this.ngReactGrid.events.SORTING, update);
        this.ngReactGrid.getData();
    } else {
        this.performLocalSort(update);
    }
};

/**
 * Simple asc -> desc, desc -> asc sorting, used for local data, resets the current page to 1
 * @param update
 */
NgReactGridReactManager.prototype.performLocalSort = function (update) {
    var copy;

    if (this.ngReactGrid.isSearching()) {
        copy = this.filteredData;
    } else {
        copy = this.originalData.slice(0);
    }

    var isAsc = update.sortInfo.dir === "asc";

    copy.sort(function (a, b) {
        var aField = this.getObjectPropertyByString(a, update.sortInfo.field);
        var bField = this.getObjectPropertyByString(b, update.sortInfo.field);

        if (isAsc) {
            return aField <= bField ? -1 : 1;
        } else {
            return aField >= bField ? -1 : 1;
        }
    }.bind(this));

    update.data = copy;
    update.currentPage = 1;

    this.ngReactGrid.update(this.ngReactGrid.events.SORTING, update);
};

/**
 * This is a recursive search function that will transverse an object searching for an index of a string
 * @param obj
 * @param search
 * @returns {boolean}
 */
NgReactGridReactManager.prototype.deepSearch = function(obj, search) {
    var found = false;

    if(obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {

                var prop = obj[i];

                if(typeof prop === "object") {
                    found = this.deepSearch(prop, search);
                    if(found === true) break;
                } else {
                    if (String(obj[i]).toLowerCase().indexOf(search) !== -1) {
                        found = true;
                        break;
                    }
                }


            }
        }
    }

    return found;
};

/**
 * Search callback for everytime the user updates the search box, supports local mode and server mode
 * @param search
 */
NgReactGridReactManager.prototype.setSearch = function (search) {
    var update = {
        search: search
    };

    if (this.ngReactGrid.isLocalMode()) {
        search = String(search).toLowerCase();

        this.filteredData = this.originalData.slice(0).filter(function (obj) {
            var found = false;
            found = this.deepSearch(obj, search);
            return found;
        }.bind(this));

        update.data = this.filteredData;
        update.currentPage = 1;

        this.ngReactGrid.update(this.ngReactGrid.events.SEARCH, update);

    } else {
        this.ngReactGrid.search = search;
        this.ngReactGrid.getData();
    }
};

/**
 * Pagination call back, called every time a pagination change is made
 * @param page
 */
NgReactGridReactManager.prototype.goToPage = function (page) {

    var update = {
        currentPage: page
    };

    this.ngReactGrid.update(this.ngReactGrid.events.PAGINATION, update);

    if (this.ngReactGrid.isServerMode()) {
        this.ngReactGrid.getData();
    }
};

/**
 * Row click callback
 * @param row
 */
NgReactGridReactManager.prototype.rowClick = function(row) {
    this.ngReactGrid.rowClick(row);
};

/**
 * This function is called from React to make sure that any callbacks being passed into react cell components, update the
 * angular scope
 * @param cell
 * @returns {*}
 */
NgReactGridReactManager.prototype.wrapFunctionsInAngular = function (cell) {
    for (var key in cell.props) {
        if (cell.props.hasOwnProperty(key)) {
            if (key === "children" && cell.props[key]) {
                this.wrapFunctionsInAngular(cell.props[key]);
            } else if (typeof cell.props[key] === 'function') {
                cell.props[key] = this.wrapWithRootScope(cell.props[key]);
            }
        }

    }
    return cell;
};

/**
 * This is the wrapping function on all callbacks passed into the React cell components for ngReactGrid
 * @param func
 * @returns {Function}
 */
NgReactGridReactManager.prototype.wrapWithRootScope = function (func) {
    var self = this;
    return function () {
        var args = arguments;
        var phase = self.ngReactGrid.rootScope.$$phase;

        if (phase == '$apply' || phase == '$digest') {
            func.apply(null, args);
        } else {
            self.ngReactGrid.rootScope.$apply(function () {
                func.apply(null, args);
            });
        }
    };
};

/**
 * This function allows you to get a property from any object, no matter how many levels deep it is
 * MOVE THIS FUNCTION INTO ITS OWN CLASS
 * @param object
 * @param str
 * @static
 * @returns {*}
 */
NgReactGridReactManager.getObjectPropertyByString = function (object, str) {

    /**
     * Convert indexes to properties
     */
    str = str.replace(/\[(\w+)\]/g, '.$1');

    /**
     * Strip a leading dot
     */
    str = str.replace(/^\./, '');
    var a = str.split('.');
    while (a.length) {
        var n = a.shift();
        if (object != null && n in object) {
            object = object[n];
        } else {
            return;
        }
    }
    return object;
};

/**
 * Updates an object property given a specified path, it will create the object if it doesn't exist
 * @static
 * @param obj
 * @param path
 * @param value
 */
NgReactGridReactManager.updateObjectPropertyByString = function(obj, path, value) {
    var a = path.split('.');
    var o = obj;
    for (var i = 0; i < a.length - 1; i++) {
        var n = a[i];
        if (n in o) {
            o = o[n];
        } else {
            o[n] = {};
            o = o[n];
        }
    }
    o[a[a.length - 1]] = value;
};

module.exports = NgReactGridReactManager;

},{}],4:[function(require,module,exports){
var ngReactGrid = require("../classes/NgReactGrid");

var ngReactGridDirective = function ($rootScope) {
    return {
        restrict: "E",
        scope : {
            grid : "="
        },
        link: function (scope, element, attrs) {
            new ngReactGrid(scope, element, attrs, $rootScope);
        }
    }
};

module.exports = ngReactGridDirective;


},{"../classes/NgReactGrid":1}],5:[function(require,module,exports){
var _ = require('../vendors/miniUnderscore');
var NgReactGridReactManager = require("../classes/NgReactGridReactManager");

var ngReactGridCheckboxFactory = function($rootScope) {
    var ngReactGridCheckbox = function(selectionTarget, options, render) {
        var defaultOptions = {
            disableCheckboxField: '',
            hideDisabledCheckboxField: false,
            getObjectPropertyByStringFn: NgReactGridReactManager.getObjectPropertyByString,
            batchToggle: false,
            headerStyle: {
                textAlign: "center"
            }
        };
        var _options = _.extend({}, defaultOptions, options);

        return {
            field: "",
            fieldName: "",
            displayName: "",
            title: "Select/Deselect All",
            options: _options,
            inputType: (_options.batchToggle) ? "checkbox" : undefined,
            handleHeaderClick: function(checkedValue, data) {
                // Sends header 'batch toggle' checkbox value to rows
                window.dispatchEvent(new CustomEvent("setNgReactGridCheckboxStateFromEvent", {detail: {checked: checkedValue}}));

                // Empties bounded selected target or populates with
                //   non-disabled checkbox rows data
                $rootScope.$apply(function() {
                  while (selectionTarget.length) {selectionTarget.pop();}
                  if (checkedValue) {
                    data.forEach(function(row) {
                      if (!_options.getObjectPropertyByStringFn(row, _options.disableCheckboxField)) {
                        selectionTarget.push(row);
                      }
                    });
                  }
                });
            },
            render: function(row) {
                if( render ){
                    var customRender = render( row );

                    if( customRender )
                        return customRender;
                }

                var handleClick = function() {
                    // Sends event to uncheck header 'batch toggle' checkbox
                    window.dispatchEvent(new CustomEvent("setNgReactGridCheckboxHeaderStateFromEvent", {detail: {checked: false}}));

                    var index = selectionTarget.indexOf(row);
                    if(index === -1) {
                        selectionTarget.push(row);
                    } else {
                        selectionTarget.splice(index, 1);
                    }
                };
                return ngReactGridCheckboxComponent({selectionTarget: selectionTarget, handleClick: handleClick, row: row, options: _options});;
            },
            sort: false,
            width: 1
        }
    };

    return ngReactGridCheckbox;
};

module.exports = ngReactGridCheckboxFactory;

},{"../classes/NgReactGridReactManager":3,"../vendors/miniUnderscore":10}],6:[function(require,module,exports){
var NgReactGridReactManager = require("../classes/NgReactGridReactManager");

var ngReactGridCheckboxFieldFactory = function() {

    var ngReactGridCheckboxField = function(record, field, updateNotification) {
        this.record = record;
        this.field = field;
        this.updateNotification = updateNotification;

        var value = NgReactGridReactManager.getObjectPropertyByString(this.record, this.field);
        return ngReactGridCheckboxFieldComponent({value: value, updateValue: this.updateValue.bind(this)});
    };

    ngReactGridCheckboxField.prototype.updateValue = function(newValue) {
        NgReactGridReactManager.updateObjectPropertyByString(this.record, this.field, newValue);

        if(this.updateNotification) {
            this.updateNotification(this.record);
        }
    };

    return ngReactGridCheckboxField;

};

module.exports = ngReactGridCheckboxFieldFactory;
},{"../classes/NgReactGridReactManager":3}],7:[function(require,module,exports){
var NgReactGridReactManager = require("../classes/NgReactGridReactManager");

var ngReactGridSelectFieldFactory = function($rootScope) {

    var ngReactGridSelectField = function(record, field, referenceData, updateNotification) {
        this.record = record;
        this.field = field;
        this.updateNotification = updateNotification;
        this.referenceData = referenceData;

        var value = NgReactGridReactManager.getObjectPropertyByString(this.record, this.field);

        return ngReactGridSelectFieldComponent({value: value, updateValue: this.updateValue.bind(this), referenceData: (referenceData || [])});
    };

    ngReactGridSelectField.prototype.updateValue = function(newValue) {

        var updateValue = {};

        for(var i in this.referenceData) {
            var option = this.referenceData[i];

            if(option.id == newValue) {
                updateValue = option;
            }
        }

        NgReactGridReactManager.updateObjectPropertyByString(this.record, this.field, updateValue);

        if(this.updateNotification) {
            if($rootScope.$$phase) {
                this.updateNotification(this.record);
            } else {
                $rootScope.$apply(function () {
                    this.updateNotification(this.record);
                }.bind(this));
            }
        }
    };

    return ngReactGridSelectField;

};

module.exports = ngReactGridSelectFieldFactory;
},{"../classes/NgReactGridReactManager":3}],8:[function(require,module,exports){
var NgReactGridReactManager = require("../classes/NgReactGridReactManager");

var ngReactGridTextFieldFactory = function($rootScope) {

    var ngReactGridTextField = function(record, field, updateNotification) {
        this.record = record;
        this.field = field;
        this.updateNotification = updateNotification;

        var value = NgReactGridReactManager.getObjectPropertyByString(this.record, this.field);

        return ngReactGridTextFieldComponent({value: value, updateValue: this.updateValue.bind(this)});
    };

    ngReactGridTextField.prototype.updateValue = function(newValue) {
        NgReactGridReactManager.updateObjectPropertyByString(this.record, this.field, newValue);

        if(this.updateNotification) {
            if($rootScope.$$phase) {
                this.updateNotification(this.record);
            } else {
                $rootScope.$apply(function () {
                    this.updateNotification(this.record);
                }.bind(this));
            }
        }
    };

    return ngReactGridTextField;

};

module.exports = ngReactGridTextFieldFactory;
},{"../classes/NgReactGridReactManager":3}],9:[function(require,module,exports){
'use strict';

var ngReactGridDirective = require('./directives/ngReactGridDirective');
var ngReactGridCheckboxFactory = require('./factories/ngReactGridCheckboxFactory');
var ngReactGridTextFieldFactory = require("./factories/ngReactGridTextFieldFactory");
var ngReactGridCheckboxFieldFactory = require("./factories/ngReactGridCheckboxFieldFactory");
var ngReactGridSelectFieldFactory = require("./factories/ngReactGridSelectFieldFactory");

angular.module('ngReactGrid', [])
    .factory("ngReactGridCheckbox", ['$rootScope', ngReactGridCheckboxFactory])
    .factory("ngReactGridTextField", ['$rootScope', ngReactGridTextFieldFactory])
    .factory("ngReactGridCheckboxField", [ngReactGridCheckboxFieldFactory])
    .factory("ngReactGridSelectField", ['$rootScope', ngReactGridSelectFieldFactory])
    .directive("ngReactGrid", ['$rootScope', ngReactGridDirective]);

},{"./directives/ngReactGridDirective":4,"./factories/ngReactGridCheckboxFactory":5,"./factories/ngReactGridCheckboxFieldFactory":6,"./factories/ngReactGridSelectFieldFactory":7,"./factories/ngReactGridTextFieldFactory":8}],10:[function(require,module,exports){
var _ = {
    nativeForEach: Array.prototype.forEach,
    each: function (obj, iterator, context) {
        if (obj == null) return obj;
        if (this.nativeForEach && obj.forEach === this.nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            var keys = _.keys(obj);
            for (var i = 0, length = keys.length; i < length; i++) {
                if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
            }
        }
        return obj;
    },
    slice: Array.prototype.slice,
    extend: function (obj) {
        this.each(this.slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    }
};

module.exports = _;

},{}]},{},[9])