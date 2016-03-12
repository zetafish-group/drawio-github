var nanocms = function(elt)
{
	var urlParams = (function()
	{
		var result = new Object();
		var params = window.location.search.slice(1).split('&');
	
		for (var i = 0; i < params.length; i++)
		{
			idx = params[i].indexOf('=');
		
			if (idx > 0)
			{
				result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
			}
		}
	
		return result;
	})();

	// Uses first part of path as repo name.
	// Change this according to your setup.
	var tokens = window.location.pathname.split('/');

	if (tokens.length >= 2 && urlParams['action'] == 'edit')
	{
		elt.setAttribute('contenteditable', 'true');
		elt.focus();
		
		// Edits an image with drawio class on double click
		document.addEventListener('dblclick', function(evt)
		{
			var url = 'https://test.draw.io/?dev=1&embed=1&ui=atlas&spin=1&modified=unsavedChanges&proto=json';
			var source = evt.srcElement || evt.target;
	
			if (source.nodeName == 'IMG' && source.className == 'drawio')
			{
				// Checks if the elt is inside a content editable element
				var parent = source;
		
				while (parent != null && parent.nodeType == 1 &&
					parent.getAttribute('contentEditable') != 'true')
				{
					parent = parent.parentNode;
				}
	
				if (parent != null && parent.nodeType == 1 && parent.getAttribute('contentEditable') == 'true')
				{
					if (source.drawIoWindow == null || source.drawIoWindow.closed)
					{
						// Implements protocol for loading and exporting with embedded XML
						var receive = function(evt)
						{
							if (evt.data.length > 0 && evt.source == source.drawIoWindow)
							{
								var msg = JSON.parse(evt.data);

								// Received if the editor is ready
								if (msg.event == 'init')
								{
									// Sends the data URI with embedded XML to editor
									source.drawIoWindow.postMessage(JSON.stringify({action: 'load', xmlpng: source.getAttribute('src')}), '*');
								}
								// Received if the user clicks save
								else if (msg.event == 'save')
								{
									// Sends a request to export the diagram as XML with embedded PNG
									source.drawIoWindow.postMessage(JSON.stringify({action: 'export', format: 'xmlpng', spinKey: 'saving'}), '*');
								}
								// Received if the export request was processed
								else if (msg.event == 'export')
								{
									// Updates the data URI of the image
									source.setAttribute('src', msg.data);
								}
		
								// Received if the user clicks exit or after export
								if (msg.event == 'exit' || msg.event == 'export')
								{
									// Closes the editor
									window.removeEventListener('message', receive);
									source.drawIoWindow.close();
									source.drawIoWindow = null;
								}
							}
						};

						// Opens the editor
						window.addEventListener('message', receive);
						source.drawIoWindow = window.open(url);
					}
					else
					{
						// Shows existing editor window
						source.drawIoWindow.focus();
					}
				}
			}
		}, true);

		var repo = tokens[1];
		var path = tokens.slice(2).join('/');
		var ref = 'gh-pages';

		var save = function(callback)
		{
			var username = urlParams['username'] || prompt('Username');
	
			if (username == null || username.length == 0)
			{
				callback();
				return;
			}
	
			var password = urlParams['pass'] || prompt('Password');
	
			if (password == null || password.length == 0)
			{
				callback();
				return;
			}
	
			var msg = prompt('Commit Message', 'Changed ' + tokens[tokens.length - 1]);
	
			if (msg == null)
			{
				callback();
				return;
			}
				
			var url = 'https://api.github.com/repos/' + username + '/' + repo +
				'/contents/' + path + '?ref=' + encodeURIComponent(ref);

			getSha(url, username, password, function(sha)
			{
				writeFile(url, username, password, sha, msg, function(req)
				{
					var success = req.status == 200 || req.status == 201;
			
					if (!success)
					{
						var obj = JSON.parse(req.responseText);
				
						alert((obj != null) ? obj.message : 'Error');
					}
					
					callback(success);
				});
			});
		};

		var getSha = function(url, username, password, callback)
		{
			xhr('GET', url, null, username, password, function(req)
			{
				if (req.status == 200)
				{
					var obj = JSON.parse(req.responseText);
			
					callback((obj != null) ? obj.sha : null);
				}
				else
				{
					callback(null);
				}
			});
		};

		var writeFile = function(url, username, password, sha, msg, callback)
		{
			var entity =
			{
				path: path,
				message: msg,
				content: btoa(document.documentElement.outerHTML)
			};			

			if (sha != null)
			{
				entity.sha = sha;
			}

			xhr('PUT', url, JSON.stringify(entity), username, password, function(req)
			{
				if (req.readyState == 4)
				{
					callback(req);
				}
			});
		};

		var xhr = function xhr(verb, url, data, username, pass, callback)
		{
			var req = new XMLHttpRequest();
			req.onreadystatechange = function()
			{
				if (req.readyState == 4)
				{
					callback(req);
				}
			};

			req.open(verb, url, true);

			req.setRequestHeader('Authorization', 'Basic ' +
				btoa(username + ':' + pass));

			req.send(data);
		};
				
		var cancel = document.createElement('button');
		cancel.innerHTML = 'Cancel';
		var initial = document.documentElement.outerHTML;
		
		cancel.addEventListener('click', function()
		{
			if (initial == document.documentElement.outerHTML ||
				confirm('You will lose all unsaved work'))
			{
				window.location.search = '?t=' + new Date().getTime();
			}
		});
		
		var button = document.createElement('button');
		button.innerHTML = 'Save';

		button.addEventListener('click', function()
		{
		
			elt.removeAttribute('contenteditable');
			cancel.parentNode.removeChild(cancel);
			button.parentNode.removeChild(button);
			save(function()
			{
				document.body.appendChild(cancel);
				document.body.appendChild(button);
				elt.setAttribute('contenteditable', 'true');
				elt.focus();
			});
		});
		
		document.body.appendChild(cancel);
		document.body.appendChild(button);
	}
};
