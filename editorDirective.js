/*!
 * Author: Murali Mothupally
 * Angular-WYSIWYG-Editor
 * This is a wrapper over jquery wysiwyg editor from suyati guys http://suyati.github.io/line-control.
 * This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.
This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
You should have received a copy of the GNU General Public License along with this library; if not, write to the Free Software Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 *
*/
(function () {
    var app = angular.module('sample');
    app.directive("contenteditable", ['$sce',function ($sce) {
        return {
            restrict: "A",
            require: "ngModel",
            link: function (scope, element, attrs, ngModel) {

                function read() {
                    console.log(element.html());
                    ngModel.$setViewValue($sce.trustAsHtml(element.html()));
                }

                ngModel.$render = function () {
                    element.html(ngModel.$viewValue || "");
                };

                element.bind("blur keyup change", function () {
                    scope.$apply(read);
                });
            }
        };
    }]);
    app.directive('editor', function () {
        return {
            restrict: 'E',
            template: '<div id="editorContainer" class="modal show" style="margin-top:175px; ">\
                        <div id="myEditor" class: "row-fluid Editor-container">\
                                        <div id="myEditorEditor" class="Editor-editor" style="overflow:auto" contenteditable="true" ng-model="content"></div>\
                                        </div>\
                        </div>',
            
            scope: {
                content: '=content',
                maxchar: '=maxchar'
            },
            link: function (scope, element, attr, controller) {
                var editorObj;
                var maxCharacters = 0;
                var currentFieldText = '';

                var controlKeyCodes = [8, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 46, 91, 92, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123];
                scope.content = "Sample Text";
                var methods = {
                    saveSelection: function () {
                        //Function to save the text selection range from the editor
                        element.data('editor').focus();
                        if (window.getSelection) {
                            sel = window.getSelection();
                            if (sel.getRangeAt && sel.rangeCount) {
                                element.data('currentRange', sel.getRangeAt(0));
                            }
                        } else if (document.selection && document.selection.createRange) {
                            element.data('currentRange', document.selection.createRange());
                        }
                        else
                            element.data('currentRange', null);
                    },
                    restoreSelection: function (text, mode) {
                        //Function to restore the text selection range from the editor
                        var node;
                        typeof text !== 'undefined' ? text : false;
                        typeof mode !== 'undefined' ? mode : "";
                        var range = element.data('currentRange');
                        if (range) {
                            if (window.getSelection) {
                                if (text) {
                                    range.deleteContents();
                                    if (mode == "html") {
                                        var el = document.createElement("div");
                                        el.innerHTML = text;
                                        var frag = document.createDocumentFragment(), node, lastNode;
                                        while ((node = el.firstChild)) {
                                            lastNode = frag.appendChild(node);
                                        }
                                        range.insertNode(frag);
                                    }
                                    else
                                        range.insertNode(document.createTextNode(text));

                                }
                                sel = window.getSelection();
                                sel.removeAllRanges();
                                sel.addRange(range);
                            }
                            else if (document.selection && range.select) {
                                range.select();
                                if (text) {
                                    if (mode == "html")
                                        range.pasteHTML(text);
                                    else
                                        range.text = text;
                                }
                            }
                        }
                    },
                    restoreIESelection: function () {
                        //Function to restore the text selection range from the editor in IE
                        var range = element.data('currentRange');
                        if (range) {
                            if (window.getSelection) {
                                sel = window.getSelection();
                                sel.removeAllRanges();
                                sel.addRange(range);
                            } else if (document.selection && range.select) {
                                range.select();
                            }
                        }
                    },
                    insertTextAtSelection: function (text, mode) {
                        var sel, range, node;
                        typeof mode !== 'undefined' ? mode : "";
                        if (window.getSelection) {
                            sel = window.getSelection();
                            if (sel.getRangeAt && sel.rangeCount) {
                                range = sel.getRangeAt(0);
                                range.deleteContents();
                                var textNode = document.createTextNode(text);

                                if (mode == "html") {
                                    var el = document.createElement("div");
                                    el.innerHTML = text;
                                    var frag = document.createDocumentFragment(), node, lastNode;
                                    while ((node = el.firstChild)) {
                                        lastNode = frag.appendChild(node);
                                    }
                                    range.insertNode(frag);
                                }
                                else {
                                    range.insertNode(textNode);
                                    range.selectNode(textNode);
                                }
                                sel.removeAllRanges();
                                range = range.cloneRange();
                                range.collapse(false);
                                sel.addRange(range);
                            }
                        } else if (document.selection && document.selection.createRange) {
                            range = document.selection.createRange();
                            range.pasteHTML(text);
                            range.select();
                        }
                    },
                    init: function (options) {
                        var fonts = {
                            "Sans serif": "arial,helvetica,sans-serif",
                            "Serif": "times new roman,serif",
                            "Wide": "arial black,sans-serif",
                            "Narrow": "arial narrow,sans-serif",
                            "Comic Sans MS": "comic sans ms,sans-serif",
                            "Courier New": "courier new,monospace",
                            "Garamond": "garamond,serif",
                            "Georgia": "georgia,serif",
                            "Tahoma": "tahoma,sans-serif",
                            "Trebuchet MS": "trebuchet ms,sans-serif",
                            "Verdana": "verdana,sans-serif"
                        };

                        var styles = {
                            "Heading 1": "<h1>",
                            "Heading 2": "<h2>",
                            "Heading 3": "<h3>",
                            "Heading 4": "<h4>",
                            "Heading 5": "<h5>",
                            "Heading 6": "<h6>",
                            "Paragraph": "<p>"
                        };

                        var fontsizes = {
                            "Small": "2",
                            "Normal": "3",
                            "Medium": "4",
                            "Large": "5",
                            "Huge": "6"
                        };

                        var colors = [{ name: 'Black', hex: '#000000' },
                                        { name: 'MediumBlack', hex: '#444444' },
                                        { name: 'LightBlack', hex: '#666666' },
                                        { name: 'DimBlack', hex: '#999999' },
                                        { name: 'Gray', hex: '#CCCCCC' },
                                        { name: 'DimGray', hex: '#EEEEEE' },
                                        { name: 'LightGray', hex: '#F3F3F3' },
                                        { name: 'White', hex: '#FFFFFF' },

                                        { name: 'libreak', hex: null },

                                        { name: 'Red', hex: '#FF0000' },
                                        { name: 'Orange', hex: '#FF9900' },
                                        { name: 'Yellow', hex: '#FFFF00' },
                                        { name: 'Lime', hex: '#00FF00' },
                                        { name: 'Cyan', hex: '#00FFFF' },
                                        { name: 'Blue', hex: '#0000FF' },
                                        { name: 'BlueViolet', hex: '#8A2BE2' },
                                        { name: 'Magenta', hex: '#FF00FF' },

                                        { name: 'libreak', hex: null },

                                        { name: 'LightPink', hex: '#FFB6C1' },
                                        { name: 'Bisque', hex: '#FCE5CD' },
                                        { name: 'BlanchedAlmond', hex: '#FFF2CC' },
                                        { name: 'LightLime', hex: '#D9EAD3' },
                                        { name: 'LightCyan', hex: '#D0E0E3' },
                                        { name: 'AliceBlue', hex: '#CFE2F3' },
                                        { name: 'Lavender', hex: '#D9D2E9' },
                                        { name: 'Thistle', hex: '#EAD1DC' },

                                        { name: 'LightCoral', hex: '#EA9999' },
                                        { name: 'Wheat', hex: '#F9CB9C' },
                                        { name: 'NavajoWhite', hex: '#FFE599' },
                                        { name: 'DarkSeaGreen', hex: '#B6D7A8' },
                                        { name: 'LightBlue', hex: '#A2C4C9' },
                                        { name: 'SkyBlue', hex: '#9FC5E8' },
                                        { name: 'LightPurple', hex: '#B4A7D6' },
                                        { name: 'PaleVioletRed', hex: '#D5A6BD' },

                                        { name: 'IndianRed', hex: '#E06666' },
                                        { name: 'LightSandyBrown', hex: '#F6B26B' },
                                        { name: 'Khaki', hex: '#FFD966' },
                                        { name: 'YellowGreen', hex: '#93C47D' },
                                        { name: 'CadetBlue', hex: '#76A5AF' },
                                        { name: 'DeepSkyBlue', hex: '#6FA8DC' },
                                        { name: 'MediumPurple', hex: '#8E7CC3' },
                                        { name: 'MediumVioletRed', hex: '#C27BA0' },

                                        { name: 'Crimson', hex: '#CC0000' },
                                        { name: 'SandyBrown', hex: '#E69138' },
                                        { name: 'Gold', hex: '#F1C232' },
                                        { name: 'MediumSeaGreen', hex: '#6AA84F' },
                                        { name: 'Teal', hex: '#45818E' },
                                        { name: 'SteelBlue', hex: '#3D85C6' },
                                        { name: 'SlateBlue', hex: '#674EA7' },
                                        { name: 'VioletRed', hex: '#A64D79' },

                                        { name: 'Brown', hex: '#990000' },
                                        { name: 'Chocolate', hex: '#B45F06' },
                                        { name: 'GoldenRod', hex: '#BF9000' },
                                        { name: 'Green', hex: '#38761D' },
                                        { name: 'SlateGray', hex: '#134F5C' },
                                        { name: 'RoyalBlue', hex: '#0B5394' },
                                        { name: 'Indigo', hex: '#351C75' },
                                        { name: 'Maroon', hex: '#741B47' },

                                        { name: 'DarkRed', hex: '#660000' },
                                        { name: 'SaddleBrown', hex: '#783F04' },
                                        { name: 'DarkGoldenRod', hex: '#7F6000' },
                                        { name: 'DarkGreen', hex: '#274E13' },
                                        { name: 'DarkSlateGray', hex: '#0C343D' },
                                        { name: 'Navy', hex: '#073763' },
                                        { name: 'MidnightBlue', hex: '#20124D' },
                                        { name: 'DarkMaroon', hex: '#4C1130' }];

                        var specialchars = [{ name: "Exclamation ", text: "!" },
                                            { name: "At", text: "@" },
                                            { name: "Hash", text: "#" },
                                            { name: "Percentage", text: "%" },
                                            { name: "Uppercase", text: "^" },
                                            { name: "Ampersand", text: "&" },
                                            { name: "Asterisk", text: "*" },
                                            { name: "OpenBracket", text: "(" },
                                            { name: "CloseBracket", text: ")" },
                                            { name: "Underscore", text: "_" },
                                            { name: "Hiphen", text: "-" },
                                            { name: "Plus", text: "+" },
                                            { name: "Equalto", text: "=" },
                                            { name: "OpenSquareBracket", text: "[" },
                                            { name: "CloseSquareBracket", text: "]" },
                                            { name: "OpenCurly", text: "{" },
                                            { name: "CloseCurly", text: "}" },
                                            { name: "Pipe", text: "|" },
                                            { name: "Colon", text: ":" },
                                            { name: "Semicolon", text: ";" },
                                            { name: "Single quote", text: "&#39;" },
                                            { name: "Double quote", text: "&#34;" },
                                            { name: "Left single curly quote", text: "&lsquo;" },
                                            { name: "right single curly quote", text: "&rsquo;" },
                                            { name: "Forward-slash", text: "&#47;" },
                                            { name: "Back-slash", text: "&#92;" },
                                            { name: "LessThan", text: "<" },
                                            { name: "GreaterThan", text: ">" },
                                            { name: "QuestionMark", text: "?" },
                                            { name: "Tilda", text: "~" },
                                            { name: "Grave accent", text: "`" },
                                            { name: "Micron", text: "&micro;" },
                                            { name: "Paragraph sign", text: "&para;" },
                                            { name: "Plus/minus", text: "&plusmn;" },
                                            { name: "Trademark", text: "&trade;" },
                                            { name: "Copyright", text: "&copy;" },
                                            { name: "Registered", text: "&reg;" },
                                            { name: "Section", text: "&sect;" },
                                            { name: "right double angle quotes", text: "&#187;" },
                                            { name: "fraction one quarter", text: "&#188;" },
                                            { name: "fraction one half", text: "&#189;" },
                                            { name: "fraction three quarters", text: "&#190;" },
                                            { name: "Dollar", text: "$" },
                                            { name: "Euro", text: "&euro;" },
                                            { name: "Pound", text: "&pound;" },
                                            { name: "Yen", text: "&yen;" },
                                            { name: "Cent", text: "&#162;" },
                                            { name: "IndianRupee", text: "&#8377;" }];

                        var menuItems = {
                            'fonteffects': true,
                            'texteffects': true,
                            'aligneffects': true,
                            'textformats': true,
                            'actions': true,
                            'insertoptions': true,
                            'extraeffects': true,
                            'advancedoptions': true,
                            'screeneffects': true,

                            'fonts': {
                                "select": true,
                                "default": "Font",
                                "tooltip": "Fonts",
                                "commandname": "fontName",
                                "custom": null
                            },

                            'styles': {
                                "select": true,
                                "default": "Formatting",
                                "tooltip": "Paragraph Format",
                                "commandname": "formatBlock",
                                "custom": null
                            },

                            'font_size': {
                                "select": true,
                                "default": "Font size",
                                "tooltip": "Font Size",
                                "commandname": "fontSize",
                                "custom": null
                            },

                            'color': {
                                "text": "A",
                                "icon": "fa fa-font",
                                "tooltip": "Text/Background Color",
                                "commandname": null,
                                "custom": function (button) {
                                    var editor = element;
                                    var flag = 0;
                                    var paletteCntr = $('<div/>', { id: "paletteCntr", class: "activeColour", css: { "display": "none", "width": "335px" } }).click(function (event) { event.stopPropagation(); });
                                    var paletteDiv = $('<div/>', { id: "colorpellete" });
                                    var palette = $('<ul />', { id: "color_ui" }).append($('<li />').css({ "width": "145px", "display": "Block", "height": "25px" }).html('<div>Text Color</div>'));
                                    var bgPalletteDiv = $('<div/>', { id: "bg_colorpellete" });
                                    var bgPallette = $('<ul />', { id: "bgcolor_ui" }).append($('<li />').css({ "width": "145px", "display": "Block", "height": "25px" }).html('<div>Background Color</div>'));
                                    if (editor.data("colorBtn")) {
                                        flag = 1;
                                        editor.data("colorBtn", null);
                                    }
                                    else
                                        editor.data("colorBtn", 1);
                                    if (flag == 0) {
                                        for (var i = 0; i < colors.length; i++) {
                                            if (colors[i].hex != null) {
                                                palette.append($('<li />').css('background-color', colors[i].hex).mousedown(function (event) { event.preventDefault(); }).click(function () {
                                                    var hexcolor = methods.rgbToHex.apply(this, [$(this).css('background-color')]);
                                                    methods.restoreSelection.apply(this);
                                                    methods.setStyleWithCSS.apply(this);
                                                    document.execCommand('forecolor', false, hexcolor);
                                                    $('#paletteCntr').remove();

                                                    editor.data("colorBtn", null);
                                                }));

                                                bgPallette.append($('<li />').css('background-color', colors[i].hex).mousedown(function (event) { event.preventDefault(); }).click(function () {
                                                    var hexcolor = methods.rgbToHex.apply(this, [$(this).css('background-color')]);
                                                    methods.restoreSelection.apply(this);
                                                    methods.setStyleWithCSS.apply(this);
                                                    document.execCommand('backColor', false, hexcolor);
                                                    $('#paletteCntr').remove();
                                                    editor.data("colorBtn", null);
                                                }));
                                            }
                                            else {
                                                palette.append($('<li />').css({ "width": "145px", "display": "Block", "height": "5px" }));
                                                bgPallette.append($('<li />').css({ "width": "145px", "display": "Block", "height": "5px" }));
                                            }
                                        }
                                        palette.appendTo(paletteDiv);
                                        bgPallette.appendTo(bgPalletteDiv);
                                        paletteDiv.appendTo(paletteCntr);
                                        bgPalletteDiv.appendTo(paletteCntr)
                                        paletteCntr.insertAfter(button);
                                        $('#paletteCntr').slideDown('slow');
                                    }
                                    else
                                        $('#paletteCntr').remove();
                                }
                            },

                            'bold': {
                                "text": "B",
                                "icon": "fa fa-bold",
                                "tooltip": "Bold",
                                "commandname": "bold",
                                "custom": null
                            },

                            'italics': {
                                "text": "I",
                                "icon": "fa fa-italic",
                                "tooltip": "Italics",
                                "commandname": "italic",
                                "custom": null
                            },

                            'underline': {
                                "text": "U",
                                "icon": "fa fa-underline",
                                "tooltip": "Underline",
                                "commandname": "underline",
                                "custom": null
                            },

                            'strikeout': {
                                "text": "Strikeout",
                                "icon": "fa fa-strikethrough",
                                "tooltip": "Strike Through",
                                "commandname": "strikeThrough",
                                "custom": null
                            },

                            'ol': {
                                "text": "N",
                                "icon": "fa fa-list-ol",
                                "tooltip": "Insert/Remove Numbered List",
                                "commandname": "insertorderedlist",
                                "custom": null
                            },

                            'ul': {
                                "text": "Bullet",
                                "icon": "fa fa-list-ul",
                                "tooltip": "Insert/Remove Bulleted List",
                                "commandname": "insertunorderedlist",
                                "custom": null
                            },

                            'undo': {
                                "text": "undo",
                                "icon": "fa fa-undo",
                                "tooltip": "Undo",
                                "commandname": "undo",
                                "custom": null
                            },

                            'redo': {
                                "text": "redo",
                                "icon": "fa fa-repeat",
                                "tooltip": "Redo",
                                "commandname": "redo",
                                "custom": null
                            },

                            'l_align': {
                                "text": "leftalign",
                                "icon": "fa fa-align-left",
                                "tooltip": "Align Left",
                                "commandname": "justifyleft",
                                "custom": null
                            },

                            'r_align': {
                                "text": "rightalign",
                                "icon": "fa fa-align-right",
                                "tooltip": "Align Right",
                                "commandname": "justifyright",
                                "custom": null
                            },

                            'c_align': {
                                "text": "centeralign",
                                "icon": "fa fa-align-center",
                                "tooltip": "Align Center",
                                "commandname": "justifycenter",
                                "custom": null
                            },

                            'justify': {
                                "text": "justify",
                                "icon": "fa fa-align-justify",
                                "tooltip": "Justify",
                                "commandname": "justifyfull",
                                "custom": null
                            },

                            'unlink': {
                                "text": "Unlink",
                                "icon": "fa fa-unlink",
                                "tooltip": "Unlink",
                                "commandname": "unlink",
                                "custom": null
                            },



                            'indent': {
                                "text": "Indent",
                                "icon": "fa fa-indent",
                                "tooltip": "Increase Indent",
                                "commandname": "indent",
                                "custom": null
                            },

                            'outdent': {
                                "text": "Outdent",
                                "icon": "fa fa-outdent",
                                "tooltip": "Decrease Indent",
                                "commandname": "outdent",
                                "custom": null
                            },



                            'rm_format': {
                                "text": "Remove format",
                                "icon": "fa fa-eraser",
                                "tooltip": "Remove Formatting",
                                "commandname": "removeformat",
                                "custom": null
                            },

                            'select_all': {
                                "text": "Select all",
                                "icon": "fa fa-file-text",
                                "tooltip": "Select All",
                                "commandname": null,
                                "custom": function () {
                                    document.execCommand("selectall", null, null);
                                }
                            },

                            'togglescreen': {
                                "text": "Toggle Screen",
                                "icon": "fa fa-arrows-alt",
                                "tooltip": "Toggle Screen",
                                "commandname": null,
                                "custom": function (button, parameters) {
                                    element.data("editor").parent().toggleClass('fullscreen');
                                    var statusdBarHeight = 0;
                                    if (element.data("statusBar").length) {
                                        statusdBarHeight = element.data("statusBar").height();
                                    }
                                    if (element.data("editor").parent().hasClass('fullscreen'))
                                        element.data("editor").css({ "height": element.data("editor").parent().height() - (element.data("menuBar").height() + statusdBarHeight) - 13 });
                                    else
                                        element.data("editor").css({ "height": "" });
                                }
                            },

                            'splchars': {
                                "text": "S",
                                "icon": "fa fa-asterisk",
                                "tooltip": "Insert Special Character",
                                "commandname": null,
                                "custom": function (button) {
                                    methods.restoreIESelection.apply(this);
                                    var flag = 0;
                                    var splCharDiv = $('<div/>', { id: "specialchar", class: "specialCntr", css: { "display": "none" } }).click(function (event) { event.stopPropagation(); });
                                    var splCharUi = $('<ul />', { id: "special_ui" });
                                    var editor_Content = this;
                                    if (element.data("editor").data("splcharsBtn")) {
                                        flag = 1;
                                        element.data("editor").data("splcharsBtn", null);
                                    }
                                    else
                                        element.data("editor").data("splcharsBtn", 1);

                                    if (flag == 0) {
                                        for (var i = 0; i < specialchars.length; i++) {
                                            splCharUi.append($('<li />').html(specialchars[i].text).attr('title', specialchars[i].name).mousedown(function (event) { event.preventDefault(); }).click(function (event) {
                                                if (navigator.userAgent.match(/MSIE/i)) {
                                                    var specCharHtml = element.html();
                                                    methods.insertTextAtSelection.apply(this, [specCharHtml, 'html']);
                                                }
                                                else {
                                                    document.execCommand('insertHTML', false, element.html());
                                                }
                                                $('#specialchar').remove();
                                                $(editor_Content).data("editor").data("splcharsBtn", null);
                                            }));
                                        }
                                        splCharUi.prependTo(splCharDiv);
                                        splCharDiv.insertAfter(button)
                                        $('#specialchar').slideDown('slow');
                                    }
                                    else
                                        $('#specialchar').remove();
                                }
                            },


                            "params": { "obj": null },
                        };

                        var menuGroups = {
                            'texteffects': ['bold', 'italics', 'underline', 'color'],
                            'aligneffects': ['l_align', 'c_align', 'r_align', 'justify'],
                            'textformats': ['indent', 'outdent', 'ol', 'ul'],
                            'fonteffects': ['fonts', 'styles', 'font_size'],
                            'actions': ['undo', 'redo'],
                            'insertoptions': ['insert_link', 'unlink', 'insert_img', 'insert_table'],
                            'extraeffects': ['strikeout', 'hr_line', 'splchars'],
                            'advancedoptions': ['print', 'rm_format', 'select_all', 'source'],
                            'screeneffects': ['togglescreen']
                        };

                        var settings = $.extend({
                            'texteffects': true,
                            'aligneffects': true,
                            'textformats': true,
                            'fonteffects': false,
                            'actions': true,
                            'insertoptions': false,
                            'extraeffects': true,
                            'advancedoptions': false,
                            'screeneffects': true,
                            'bold': true,
                            'italics': true,
                            'underline': true,
                            'ol': true,
                            'ul': true,
                            'undo': true,
                            'redo': true,
                            'l_align': true,
                            'r_align': true,
                            'c_align': true,
                            'justify': true,
                            'insert_link': false,
                            'unlink': false,
                            'insert_img': false,
                            'hr_line': false,
                            'block_quote': true,
                            'source': false,
                            'strikeout': false,
                            'indent': true,
                            'outdent': true,
                            'fonts': false,
                            'styles': false,
                            'print': false,
                            'rm_format': false,
                            'status_bar': true,
                            'font_size': false,
                            'color': colors,
                            'splchars': specialchars,
                            'insert_table': false,
                            'select_all': false,
                            'togglescreen': true
                        }, options);
                        
                        var containerDiv = $("#myEditor");
                        //var $this = element.hide();
                        //$this.after(containerDiv);

                        var menuBar = $("<div/>", {
                            id: "menuBarDiv",
                            class: "row-fluid"
                        }).prependTo(containerDiv);
                        //var editor = $("<div/>", {
                        //    class: "Editor-editor", //<div class="Editor-editor" style="overflow:auto" contenteditable="true" ng-model=content></div>
                        //    css: { overflow: "auto" },
                        //    contenteditable: "true",
                        //    "ng-model":"content",
                        //}).appendTo(containerDiv);
                        var editor = $("#myEditorEditor");
                        var statusBar = $("<div/>", {
                            id: "statusbar",
                            class: "row-fluid",
                            unselectable: "on",
                        }).appendTo(containerDiv);
                        element.data("menuBar", menuBar);
                        element.data("editor", editor);
                        element.data("statusBar", statusBar);
                        var editor_Content = this;
                        if (settings['status_bar']) {

                            editor.bind('paste', function (e) {
                                
                                var pastedText = e.originalEvent.clipboardData.getData('text');
                                var previousText = $('#txtEditor').Editor("getText", []);
                                var element = $('<div></div>').append(pastedText);
                                var pasteTextLength = methods.countChars.call(this, element);
                                
                                var wordCount = methods.getWordCount.apply(editor_Content);
                                var charCount = methods.getCharCount.apply(editor_Content);

                                if (parseInt(maxCharacters) <= parseInt(charCount) + parseInt(pasteTextLength)) {
                                    
                                    //alert('Cannot paste as it exceeds the maximum allowed length');
                                    $('#messageBanner').css('display', 'block');
                                    $('#messageBanner1').css('display', 'none');
                                    $('#message').html('Error! Cannot paste as it exceeds the maximum allowed length of ' + maxCharacters);
                                    e.preventDefault();
                                    return false;
                                }
                                else {
                                    $('#messageBanner').css('display', 'none');
                                    $('#messageBanner1').css('display', 'block');
                                }
                            });
                            editor.keydown(function (event) {
                                var previousText = scope.content;
                                console.log(previousText);
                                
                                var wordCount = methods.getWordCount.apply(editor_Content);
                                var charCount = methods.getCharCount.apply(editor_Content);

                                //if not control keys
                                if (event.ctrlKey) {
                                    if (String.fromCharCode(event.which).toLowerCase() === 'a'
                                        || String.fromCharCode(event.which).toLowerCase() === 'x'
                                        || String.fromCharCode(event.which).toLowerCase() === 'c') { // 'A' or 'a'
                                        return;
                                    }
                                }
                                if (controlKeyCodes.indexOf(event.keyCode) === -1) {
                                    charCount += 1;
                                    if (parseInt(scope.maxchar) <= parseInt(charCount)) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        $(editor_Content).data("statusBar").html('<div class="label">' + 'Words : ' + wordCount + '</div>');
                                        $(editor_Content).data("statusBar").append('<div class="label">' + 'Characters : ' + maxCharacters + '</div>');
                                        return;
                                    }
                                    else {
                                        $(editor_Content).data("statusBar").html('<div class="label">' + 'Words : ' + wordCount + '</div>');
                                        $(editor_Content).data("statusBar").append('<div class="label">' + 'Characters : ' + charCount + '</div>');
                                    }
                                }
                                else {
                                    $('#messageBanner1').css('display', 'block');
                                    $('#messageBanner').css('display', 'none');
                                    $(editor_Content).data("statusBar").html('<div class="label">' + 'Words : ' + wordCount + '</div>');
                                    $(editor_Content).data("statusBar").append('<div class="label">' + 'Characters : ' + charCount + '</div>');
                                }

                            });
                        }
                        

                        for (var item in menuItems) {
                            if (!settings[item]) { //if the display is not set to true for the button in the settings.	       		
                                if (settings[item] in menuGroups) {
                                    for (var each in menuGroups[item]) {
                                        settings[each] = false;
                                    }
                                }
                                continue;
                            }
                            if (item in menuGroups) {
                                var group = $("<div/>", { class: "btn-group" });
                                for (var index = 0; index < menuGroups[item].length; index++) {
                                    var value = menuGroups[item][index];
                                    if (settings[value]) {
                                        var menuItem = methods.createMenuItem.apply(this, [menuItems[value], settings[value], true]);
                                        group.append(menuItem);
                                    }
                                    settings[value] = false;
                                }
                                menuBar.append(group);
                            }
                            else {
                                var menuItem = methods.createMenuItem.apply(this, [menuItems[item], settings[item], true]);
                                menuBar.append(menuItem);
                            }
                        }

                        //For contextmenu	       	
                        $(document.body).mousedown(function (event) {
                            var target = $(event.target);
                            if (!target.parents().andSelf().is('#context-menu')) { // Clicked outside
                                $('#context-menu').remove();
                            }
                            if (!target.parents().andSelf().is('#specialchar') && (target.closest('a').html() != '<i class="fa fa-asterisk"></i>')) { //Clicked outside
                                if ($("#specialchar").is(':visible')) {
                                    $(editor_Content).data("editor").data("splcharsBtn", null);
                                    $('#specialchar').remove();
                                }
                            }
                            if (!target.parents().andSelf().is('#paletteCntr') && (target.closest('a').html() != '<i class="fa fa-font"></i>')) { //Clicked outside
                                if ($("#paletteCntr").is(':visible')) {
                                    $(editor_Content).data("editor").data("colorBtn", null);
                                    $('#paletteCntr').remove();
                                }
                            }
                        });
                        editor.bind("contextmenu", function (e) {
                            if ($('#context-menu').length)
                                $('#context-menu').remove();
                            var cMenu = $('<div/>', {
                                id: "context-menu"
                            }).css({
                                position: "absolute", top: e.pageY, left: e.pageX, "z-index": 9999
                            }).click(function (event) {
                                event.stopPropagation();
                            });
                            var cMenuUl = $('<ul/>', { class: "dropdown-menu on", "role": "menu" });
                            e.preventDefault();
                            if ($(e.target).is('a')) {
                                methods.createLinkContext.apply(this, [e, cMenuUl]);
                                cMenuUl.appendTo(cMenu);
                                cMenu.appendTo('body');
                            }
                            else if ($(e.target).is('td')) {
                                methods.createTableContext.apply(this, [e, cMenuUl]);
                                cMenuUl.appendTo(cMenu);
                                cMenu.appendTo('body');
                            }
                            else if ($(e.target).is('img')) {

                                methods.createImageContext.apply(this, [e, cMenuUl]);
                                cMenuUl.appendTo(cMenu);
                                cMenu.appendTo('body');
                            }
                        });
                    },
                    createMenuItem: function (itemSettings, options, returnElement) {
                        //Function to perform multiple actions.supplied arguments: itemsettings-list of buttons and button options, options: options for select input, returnelement: boolean.
                        //1.Create Select Options using Bootstrap Dropdown.
                        //2.Create modal dialog using bootstrap options
                        //3.Create menubar buttons binded with corresponding event actions
                        typeof returnElement !== 'undefined' ? returnElement : false;
                        console.log(itemSettings);
                        if (itemSettings["select"]) {
                            var menuWrapElement = $("<div/>", { class: "btn-group" });
                            var menuElement = $("<ul/>", { class: "dropdown-menu" });
                            menuWrapElement.append($('<a/>', {
                                class: "btn btn-default dropdown-toggle",
                                "data-toggle": "dropdown",
                                "href": "javascript:void(0)",
                                "title": itemSettings["tooltip"]
                            }).html(itemSettings["default"]).append($("<span/>", { class: "caret" })).mousedown(function (e) {
                                e.preventDefault();
                            }));
                            $.each(options, function (i, v) {
                                var option = $('<li/>')
                                $("<a/>", {
                                    tabindex: "-1",
                                    href: "javascript:void(0)"
                                }).html(i).appendTo(option);

                                option.click(function () {
                                    $(this).parent().parent().data("value", v);
                                    $(this).parent().parent().trigger("change")
                                });
                                menuElement.append(option);
                            });
                            var action = "change";
                        }
                        else if (itemSettings["modal"]) {
                            var menuWrapElement = methods.createModal.apply(this, [itemSettings["modalId"], itemSettings["modalHeader"], itemSettings["modalBody"], itemSettings["onSave"]]);
                            var menuElement = $("<i/>");
                            if (itemSettings["icon"])
                                menuElement.addClass(itemSettings["icon"]);
                            else
                                menuElement.html(itemSettings["text"]);
                            menuWrapElement.append(menuElement);
                            menuWrapElement.mousedown(function (obj, methods, beforeLoad) {
                                return function (e) {
                                    e.preventDefault();
                                    methods.saveSelection.apply(obj);
                                    if (beforeLoad) {
                                        beforeLoad.apply(obj);
                                    }
                                }
                            }(this, methods, itemSettings["beforeLoad"]));
                            menuWrapElement.attr('title', itemSettings['tooltip']);
                            return menuWrapElement;
                        }
                        else {
                            var menuWrapElement = $("<a/>", { href: 'javascript:void(0)', class: 'btn btn-default' });
                            var menuElement = $("<i/>");
                            if (itemSettings["icon"])
                                menuElement.addClass(itemSettings["icon"]);
                            else
                                menuElement.html(itemSettings["text"]);
                            var action = "click";
                        }
                        if (itemSettings["custom"]) {
                            menuWrapElement.bind(action, (function (obj, params) {
                                return function () {
                                    methods.saveSelection.apply(obj);
                                    itemSettings["custom"].apply(obj, [$(this), params]);
                                }
                            })(this, itemSettings['params']));
                        }
                        else {
                            menuWrapElement.data("commandName", itemSettings["commandname"]);
                            menuWrapElement.data("editor", element.data("editor"));
                            menuWrapElement.bind(action, function () { methods.setTextFormat.apply(this) });
                        }
                        menuWrapElement.attr('title', itemSettings['tooltip']);
                        menuWrapElement.css('cursor', 'pointer');
                        menuWrapElement.append(menuElement);
                        if (returnElement)
                            return menuWrapElement;
                        element.data("menuBar").append(menuWrapElement);
                    },
                    setTextFormat: function () {
                        //Function to run the text formatting options using execCommand.
                        methods.setStyleWithCSS.apply(this);
                        document.execCommand($(this).data("commandName"), false, $(this).data("value") || null);
                        element.data("editor").focus();
                        return false;
                    },
                    countWords: function (node) {
                        //Function to count the number of words recursively as the text grows in the editor.
                        var count = 0;
                        var textNodes = node.contents().filter(function () {
                            return (this.nodeType == 3);
                        });
                        for (var index = 0; index < textNodes.length; index++) {
                            text = textNodes[index].textContent;
                            text = text.replace(/[^-\w\s]/gi, ' ');
                            text = $.trim(text);
                            count = count + text.split(/\s+/).length;
                        }
                        var childNodes = node.children().each(function () {
                            count = count + methods.countWords.apply(this, [$(this)]);
                        });
                        return count
                    },
                    countChars: function (node) {
                        //Function to count the number of characters recursively as the text grows in the editor.
                        var count = 0;
                        var textNodes = node.contents().filter(function () {
                            return (this.nodeType == 3);
                        });
                        for (var index = 0; index < textNodes.length; index++) {
                            text = textNodes[index].textContent;
                            count = count + text.length;
                        }
                        var childNodes = node.children().each(function () {
                            count = count + methods.countChars.apply(this, [$(this)]);
                        });
                        return count;
                    },
                    getWordCount: function () {
                        //Function to return the word count of the text in the editor
                        return methods.countWords.apply(this, [element.data("editor")]);
                    },
                    getCharCount: function () {
                        //Function to return the character count of the text in the editor
                        return methods.countChars.apply(this, [element.data("editor")]);
                    },
                    rgbToHex: function (rgb) {
                        //Function to convert the rgb color codes into hexadecimal code
                        rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                        return "#" +
                        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
                        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
                        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2);
                    },
                    showMessage: function (target, message) {
                        //Function to show the error message. Supplied arguments:target-div id, message-message text to be displayed.
                        var errorDiv = $('<div/>', { class: "alert alert-danger" }
                            ).append($('<button/>', {
                                type: "button",
                                class: "close",
                                "data-dismiss": "alert",
                                html: "x"
                            })).append($('<span/>').html(message));
                        errorDiv.appendTo($('#' + target));
                        setTimeout(function () { $('.alert').alert('close'); }, 3000);
                    },
                    getText: function () {
                        //Function to get the source code.
                        if (!element.data("source-mode"))
                            return element.data("editor").html();
                        else
                            return element.data("editor").children().first().text();
                    },
                    setText: function (text) {

                        currentFieldText = text;
                        //Function to set the source code
                        if (!element.data("source-mode"))
                            element.data("editor").html(text);
                        else
                            element.data("editor").children().first().text(text);
                    },
                    setMaxCharacters: function (maxChar) {
                        maxCharacters = maxChar;
                        $('#txtEditor').data("statusBar").html('');
                    },
                    getMaxCharacters: function () {
                        return maxCharacters;
                    },
                    setStyleWithCSS: function () {
                        if (navigator.userAgent.match(/MSIE/i)) {	//for IE10
                            try {
                                Editor.execCommand("styleWithCSS", 0, false);
                            } catch (e) {
                                try {
                                    Editor.execCommand("useCSS", 0, true);
                                } catch (e) {
                                    try {
                                        Editor.execCommand('styleWithCSS', false, false);
                                    }
                                    catch (e) {
                                    }
                                }
                            }
                        }
                        else {
                            document.execCommand("styleWithCSS", null, true);
                        }
                    },
                };
                methods.init.apply(element);
            }
        }
    });
}());