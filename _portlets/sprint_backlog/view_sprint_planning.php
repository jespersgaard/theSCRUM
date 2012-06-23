<?php
	$ALLOCATION = $S->getTeamAllocation();	
	$UNIT = $S->getUnit();
	
	if ($ALLOCATION != NULL) {
?>

<?php if ($S->getSprintNumber() > 1 && !$S->hasTasksCopiedFromPrevious()) { ?>
<form method="post" action="#">
<input type="hidden" name="id" value="<?=$projectId?>"/>
<input type="hidden" name="sprintid" value="<?=$sprintId?>"/>	
<input type="hidden" name="showCompletedTasks" value="1"/>
<input type="hidden" name="copyFromPreviousSprint" value="1"/>

<div class="infoMsg" id="unfinishedtasks">
	<div class="inner">
        Do you want to add unfinished tasks from previous sprint to this sprint?
        <button id="unfinishedtasks-yes">Yes, please</button>
        <button id="unfinishedtasks-no">No, I'm fine</button>    
    </div>
</div>
</form>
<?php } ?>



<table>
<thead>
<tr>
	<th>#</th>
	<th>Prio</th>
	<th>Estim</th>
	<th>%</th>
	<th>User story / Task</th>
	<th colspan="4">Acceptance criteria</th><?php if (!$S->isClosed() && ($USERAUTH->isScrumMasterOf($projectId) || $USERAUTH->isProductOwnerOf($projectId))) { ?>
	<th>&nbsp;</th><?php } ?>
</tr>
</thead>
<tbody>
<?php 
	foreach ($stories as $key => $story) { 
		$D = new StoryDisplay($story);
		$D->render(($S->isClosed() ? StoryDisplay::$ClosedSprintPlanningView : StoryDisplay::$SprintPlanningView), $TASKS);
	}
?>
</tbody>
</table>

<?php if (!$S->isClosed()) { 
	$totalavailable = 0;
	foreach ($TEAM as $key => $member) {
		$percentage = isset($ALLOCATION[$member['login']]) ? $ALLOCATION[$member['login']] : '0';
		$available = round($S->getNrDays() * $S->getNrHoursPerDay() * $percentage / 100);
		$totalavailable += $available;
	}
?>
<div id="allocationtable">
<table>
<caption>Team allocation: <?=$S->getNrHoursPerDay()?> <?=$UNIT?>/day for <?=$S->getNrDays()?> days <span id="allocationtableshowhide">(Show details)</span></caption>
<thead id="teamallocationtable_thead" class="hidden">
<tr>
	<th>Team member</th>
	<th>%</th>
	<th>Available</th>
	<th>Allocated</th>
	<th>Remaining</th>
</tr>
</thead>
<tfoot>
<tr>
	<td colspan="2"><strong>Team:</strong></td>
	<td><span id="totalAvail"><?=$totalavailable?></span><?=$UNIT?></td>
	<td><span id="totalEstim"></span><?=$UNIT?></td>
	<td><span id="totalRemain"></span><?=$UNIT?></td>
</tr>
</tfoot>
<tbody id="teamallocationtable_tbody" class="hidden">
<?php 
	foreach ($TEAM as $key => $member) { 
		$percentage = isset($ALLOCATION[$member['login']]) ? $ALLOCATION[$member['login']] : '0';
		$available = round($S->getNrDays() * $S->getNrHoursPerDay() * $percentage / 100);
?>
<tr>
	<td class="teammember"><div class="inner"><?=$member['login']?></div></td>
	<td><?=$percentage?>%</td>
	<td><span id="totalAvail-<?=$member['login']?>"><?=$available?></span><?=$UNIT?></td>
	<td><span id="totalEstim-<?=$member['login']?>"></span><?=$UNIT?></td>
	<td><span id="totalRemain-<?=$member['login']?>"></span><?=$UNIT?></td>
</tr>
<?php } ?>
</tbody>
</table>
</div>

<script type="text/javascript">
<!--
var tasks = new SprintPlanning();
<?php if ($USERAUTH->isScrumMasterOf($projectId) || $USERAUTH->isProductOwnerOf($projectId)) { ?>
tasks.initWriteMode();
<?php foreach ($TASKS as $key => $task) { ?>
tasks.enableInteraction(<?=$task['id']?>, <?=$task['storyid']?>);
<?php } ?>

<?php foreach ($stories as $key => $story) { 
if ($story['percentage'] < 100 && $story['storytype'] != 2) { ?>
tasks.enableInteractionOnStory(<?=$story['id']?>);
<?php }}} else { ?>
tasks.initReadMode();
<?php } ?>
-->
</script>
<?php }} ?>