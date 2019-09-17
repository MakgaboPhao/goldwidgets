/*
 * DocumentFinder plugin
 *
 * Data attributes:
 * - data-control="documentfinder" - enables the plugin on an element
 * - data-option="value" - an option with a value
 *
 * JavaScript API:
 * $('a#someElement').documentFinder({ option: 'value' })
 *
 * Dependences:
 * - Some other plugin (jquery.dynatree.js)
 * - jquery-ui.custom.js
 * - jquery.cookie.js
 */

+function ($) { "use strict";
    var Base = $.oc.foundation.base,
        BaseProto = Base.prototype

    var DocumentFinder = function (element, options) {
        this.$el = $(element)
        this.options = options || {}

        $.oc.foundation.controlUtils.markDisposable(element)
        Base.call(this)
        this.init()
    }

    DocumentFinder.prototype = Object.create(BaseProto)
    DocumentFinder.prototype.constructor = DocumentFinder

    DocumentFinder.prototype.init = function() {

        if (this.options.isPreview === null) {
            this.options.isPreview = this.$el.hasClass('is-preview')
        }

        this.$el.one('dispose-control', this.proxy(this.dispose))

        
        // Stop here for preview mode
        if (this.options.isPreview) {
            return
        }

        this.$el.on('click', '.find-button', this.proxy(this.onClickFindButton))
        this.$el.on('click', '.find-remove-button', this.proxy(this.onClickRemoveButton))

        this.$findValue = $('[data-find-value]', this.$el)

        this.$server = $('[data-find-value]', this.$el).attr('server')

        this.$username = $('[data-find-value]', this.$el).attr('username')

        this.$password = $('[data-find-value]', this.$el).attr('password')

        this.$mode = $('[data-find-value]', this.$el).attr('mode')

    }

    DocumentFinder.prototype.dispose = function() {
        this.$el.off('click', '.find-button', this.proxy(this.onClickFindButton))
        this.$el.off('click', '.find-remove-button', this.proxy(this.onClickRemoveButton))
        this.$el.off('dispose-control', this.proxy(this.dispose))
        this.$el.removeData('oc.documentFinder')

        this.$findValue = null
        this.$el = null

        // In some cases options could contain callbacks, 
        // so it's better to clean them up too.
        this.options = null

        BaseProto.dispose.call(this)
    }

    DocumentFinder.prototype.setValue = function(value) {
        // set value and trigger change event, so that wrapping implementations
        // like mlDocumentFinder can listen for changes.
        this.$findValue.val(value).trigger('change')
    }

    DocumentFinder.prototype.onClickRemoveButton = function() {
        this.setValue('')

        this.evalIsPopulated()
    }

    DocumentFinder.prototype.onClickFindButton = function() {
        var self = this

		// Select the node that will be observed for mutations
		const targetNode = document.querySelector('body')

		// Options for the observer (which mutations to observe)
		const config = { attributes: true };

		// Callback function to execute when mutations are observed
		const callback = function(mutationsList, observer) {
		    for(let mutation of mutationsList) {
		        if (mutation.type === 'attributes') {
		        	self.openModal(self)
		            observer.disconnect() 
		        }
		    }
		}

		// Create an observer instance linked to the callback function
		const observer = new MutationObserver(callback)

		// Start observing the target node for configured mutations
		observer.observe(targetNode, config)

		// Later, you can stop observing		       

        $(this.$findValue).popup({ handler: 'onLoadContent', size: 'huge' })
        
    }

    DocumentFinder.prototype.evalIsPopulated = function() {
        var isPopulated = !!this.$findValue.val()
        this.$el.toggleClass('is-populated', isPopulated)
        $('[data-find-file-name]', this.$el).text(this.$findValue.val().substring(1))
    }

    /*
     * Get Alfresco ticket
     */
    DocumentFinder.prototype.getAlfrescoTicket = function() {
        /*$.ajax({
            url: "http://docs.parliament.gov.za/alfresco/service/api/login?u=" + this.$username + "&pw=" + this.$password + "&format=json",
            type: "GET",
            dataType: "jsonp",
            jsonp: "alf_callback",
            data: {
            	authorization: ''
            },
            success: function(result){
                this.$alf_ticket = result.data.ticket         
            },
            error: function(qXHR, textStatus, errorThrown){
                console.log(textStatus)
            },
             
        })*/

        $.request('onLogin', {
            success: function(data) {
                this.$alf_ticket = data.result
            }
        })

     }

    DocumentFinder.prototype.openModal = function(proxy) {

        var self = proxy

        var selectedItem = null

    	var saveItem = null


        var setValue = function() {
            self.$findValue.val(saveItem).trigger('change')
            var isPopulated = !!self.$findValue.val()
            self.$el.toggleClass('is-populated', isPopulated)
            $('[data-find-file-name]', self.$el).text(selectedItem)
        }

        var onSelectItem = function(node) {        	  
            saveItem = node.data.isFolder ? encodeURI(node.data.parent + '/' + node.data.title) : node.data.key              
            selectedItem = node.data.isFolder ? node.data.parent + '/' + node.data.title : node.data.title
        }

        var onToggleModal = function() {
            $('#browse-docs').modal('toggle')
        }
        var onLoadData = function(node) {
        	let config = {
        		url: self.$server,
                dataType: "jsonp",
                jsonp: "alf_callback",
                data: {
                    path: typeof node == 'undefined' ? 'Company Home/Shared' : node.data.parent + "/" + node.data.title,
                    format: "json",
                    alf_ticket: self.$alf_ticket
                }
            }

            return config
        }

        if(typeof this.$alf_ticket == 'undefined') {
            console.log('About to ajax 1')
            if(typeof self.$alf_ticket == 'undefined') {
                console.info('Getting ticket')
                $.request('onLogin', {
                    success: function(data) {
                        self.$alf_ticket = data.result
                        console.info('Recieved ticket: ' + self.$alf_ticket)
                    }
                })
                
            }
        }

        // Insert button on click event
        $('#insert-btn').click(function(){           
            setValue()
        });

        $("#tree").dynatree({
            checkbox: false,
            autoCollapse: true,
            clickFolderMode: 1,
            selectMode: 1,
            autoScroll: true,
            debugLevel: 0,

            initAjax: onLoadData(),

            onLazyRead: function(node){
                node.appendAjax(onLoadData(node))
            },

            onActivate: function(node) {
                onSelectItem(node)                
            }
        });

        //onToggleModal()

     }

    DocumentFinder.DEFAULTS = {
        isMulti: null,
        isPreview: null,
        isImage: null
    }

    // PLUGIN DEFINITION
    // ============================

    var old = $.fn.documentFinder

    $.fn.documentFinder = function(option) {
        var args = arguments;

        return this.each(function() {
            var $this   = $(this)
            var data    = $this.data('oc.documentFinder')
            var options = $.extend({}, DocumentFinder.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('oc.documentFinder', (data = new DocumentFinder(this, options)))
            if (typeof option == 'string') data[option].apply(data, args)
        })
      }

    $.fn.documentFinder.Constructor = DocumentFinder

    $.fn.documentFinder.noConflict = function() {
        $.fn.documentFinder = old
        return this
    }

    $(document).render(function() {
        $('[data-control="documentfinder"]').documentFinder()
    })

}(window.jQuery);