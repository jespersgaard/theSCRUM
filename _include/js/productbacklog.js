var StoryDefautValue = 'As a [role], I can [feature] so that [reason]';
var AcceptanceDefaultValue = 'Given [context] And [some more context]... When [event] Then [outcome] And [another outcome]...';

/**
  * Class to manage a product backlog: add story, edit story...
  */
var ProductBacklog = Class.create({
	initialize: function() { },

	// Init the "add story" button by adding a Tip listener on it
	// @param projectid ID of the project for which we want to create a new user story
	initAddStoryButton: function() {
		new ProductBacklogTip('addnewobject', "Add a new user story to this project... Loading...", {
			title: "Add a new story",
			stem: 'topLeft',
			hook: { target: 'topMiddle', tip: 'topLeft' },
			ajax: {
				url: PATH_TO_ROOT + '_ajax/story/add.php?id=' + $F('productBacklog_projectId'),
				options: { 
					onComplete: function() {
						// Once the "add story" pop-up is shown, add a Click event listener on the "add story" button
						$('productBacklog_addStory_cancel').observe('click', function(event) {
							Tips.hideAll();
						});
						$('productBacklog_addStory_submit').observe('click', function(event) {
							var productbackloginstance = new ProductBacklog();
							productbackloginstance.addNewStory();
						});
						$('new_acceptance_emptyit').observe('click', function(event) {
							$('new_acceptance').value = '';
							$('new_acceptance').focus();
						});
						$('new_story_emptyit').observe('click', function(event) {
							$('new_story').value = '';
							$('new_story').focus();
						});
					},
					onFailure: function(){ alert('Something went wrong...') } 
				}
			}
		});
	},


	/* TODO: a tentative to avoid having too many JS calls in the HTML page */
	init: function() {
		$$('tr.storyn').each(function(s) {
			var storyId = s.id.substr(9);
			var storyType = 0;
			var e = $('storyrow-' + storyId);
			if (e.hasClassName('levelone')) {
				if (e.hasClassName('epic')) {
					storyType = 2;
				} else {
					storyType = 1;
				}
			} else if (e.hasClassName('substory')) {
				storyType = 1;
			}
			alert(storyId);
			//new ProjectMngt().enableInteraction(projectId);
		});
	},
	
	initReadOnly: function() {
		$$('tr.storyn').each(function(s) {
			var storyId = s.id.substr(9);
			var e = $('storyrow-' + storyId);
			if (e.hasClassName('epic')) {
				new ProductBacklog().applyStylesToEpic(storyId);
			}
			new PBLightview("storynotes-" + storyId, $('story-story-' + storyId).innerHTML, PATH_TO_ROOT + 'notes/' + storyId);			
		});
	},

	// Add a new story to the product backlog
	addNewStory: function() {
		// Ajax call to register the new story in the DB.
		var projectId = $F('productBacklog_projectId');
		new Ajax.Updater('story_tbody', PATH_TO_ROOT + '_ajax/story/add_db.php', {
			method:'post',
			parameters: { 
				story: $F('new_story'), 
				acceptance: $F('new_acceptance'),
				storytype: Form.getInputs('productBacklog_addStory','radio','new_story_type').find(function(radio) { return radio.checked; }).value,
				id: projectId },
			insertion: Insertion.Top,
			onComplete: function(transport){
				if (200 == transport.status) {
					Tips.hideAll();
					var storyId = $('story_tbody').firstDescendant().id.substr(18);
					var storyType = $('storytype-' + storyId).innerHTML;
					var story = new Story();
					story.enableInteraction(storyId, storyType, 0);
										
					Effect.Appear('storyrow-' + storyId);
					Effect.Appear('storyrowblankline-' + storyId);

					// Reinit content of the fields, in case we want to create a new sub-story.
					$('new_story').value = StoryDefautValue;
					$('new_acceptance').value = AcceptanceDefaultValue;
				}
			},
			onFailure: function(){ alert('Something went wrong...') }
		});	
	},
	
	// Add a new story to the product backlog
	addSubStory: function(epicId) {
		// Ajax call to register the new story in the DB.
		var projectId = $F('productBacklog_projectId');
		new Ajax.Updater('storyrow-' + epicId, PATH_TO_ROOT + '_ajax/story/add_story_to_epic_db.php', {
			method:'get',
			parameters: {
				eid: epicId,
				story: $F('new_story_' + epicId), 
				acceptance: $F('new_acceptance_' + epicId),
				storytype: Form.getInputs('productBacklog_addStory-' + epicId,'radio','new_story_type-' + epicId).find(function(radio) { return radio.checked; }).value,				
				id: projectId },
			insertion: Insertion.After,
			onComplete: function(transport){
				if (200 == transport.status) {
					Tips.hideAll();
					var TrElementOfAddedStory = $('storyrow-' + epicId).next('tr');
					var TdElementOfStoryId = TrElementOfAddedStory.firstDescendant();
					var storyId = parseInt(TdElementOfStoryId.innerHTML.substr(1),10);
					var story = new Story();
					story.enableInteraction(storyId, -1, epicId);

					Effect.Appear('storyrow-' + storyId);

					new ProductBacklog().applyStylesToEpic(epicId);

					// Reinit content of the fields, in case we want to create a new sub-story.
					$('new_story_' + epicId).value = StoryDefautValue;
					$('new_acceptance_' + epicId).value = AcceptanceDefaultValue;
				}
			},
			onFailure: function(){ alert('Something went wrong...') }
		});	
	},
	
	// Apply CSS style to epic; called when changes occurs to epic (new story added, updated priorities for sub-stories...)
	applyStylesToEpic: function(epicId) {	
		currentStoryId = 0;
		first = true;
		$$('.substory' + epicId).each(function(item) {
			currentStoryId = item.id.substr(9);
			if (first) {
				first = false;
				item.addClassName('firstsubstory');
				item.removeClassName('lastsubstory');
			} else {
				item.removeClassName('firstsubstory');
				item.removeClassName('lastsubstory');
			}						
		});
		if (currentStoryId > 0) {
			$('storyrow-' + currentStoryId).addClassName('lastsubstory');
		}
	}	
});