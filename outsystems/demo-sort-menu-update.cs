eSpace => {
var screen=eSpace.MobileFlows.SelectMany(f=>f.Nodes).OfType<OutSystems.Model.UI.Mobile.IMobileScreen>().Named("TreezleDemo");
var layout=screen.Widgets.OfType<OutSystems.Model.UI.Mobile.Widgets.IMobileBlockInstanceWidget>().Single();
var main=layout.PlaceholdersContent.Single(p=>p.Placeholder.Name=="MainContent");
var shell=main.Widgets.OfType<ServiceStudio.Plugin.NRWidgets.IContainer>().Named("NativeDemo");
var settings=shell.Widgets.OfType<ServiceStudio.Plugin.NRWidgets.IContainer>().Named("DemoOptionsPanel");
foreach(var pair in new[] {new[]{"SortAlphabetical", "alphabetical", "Alphabetical order"},new[]{"SortInput", "input", "Supplied order"}}) {
 var action=screen.CreateScreenAction(pair[0]);
 var start=action.CreateNode<OutSystems.Model.Logic.Nodes.IStartNode>();
 var assign=action.CreateNode<OutSystems.Model.Logic.Nodes.IAssignNode>().ConnectedBelow(start,1371);
 assign.CreateAssignment("DemoOptions.SortOrder", "\""+pair[1]+"\"");
 var call=action.CreateNode<OutSystems.Model.Logic.Nodes.IExecuteClientActionNode>().ConnectedBelow(assign,1371);
 call.Action=screen.ScreenActions.Named("ApplyDemoOptions");
 action.CreateNode<OutSystems.Model.Logic.Nodes.IEndNode>().ConnectedBelow(call,1371);
 var button=settings.CreateWidget<ServiceStudio.Plugin.NRWidgets.IButton>();
 button.Widgets.OfType<OutSystems.Model.UI.Mobile.Widgets.ITextWidget>().First().Text=pair[2];
 button.SetStyle("\"btn tn-button\""); button.OnClick.Destination=action;
}
var handler=screen.ScreenActions.Named("HandleOnMenuCommand");
var record=handler.Nodes.OfType<OutSystems.Model.Logic.Nodes.IAssignNode>().Single(n=>n.Assignments.Any(a=>a.Variable.ToString().StartsWith("SelectedNode ")));
record.CreateAssignment("ParentId","If(EventCommandName = \"addChild\", EventNode.Id, ParentId)");
record.CreateAssignment("StatusMessage","If(EventCommandName = \"addChild\", \"Enter a unique New ID and label, then select Add node.\", StatusMessage)");
var load=screen.ScreenActions.Named("InitializeDemo").Nodes.OfType<OutSystems.Model.Logic.Nodes.IJSONDeserializeNode>().Single(n=>n.Name=="Loadcommands");
var old=load.JSONString.ToString().Split(new[]{" ["},StringSplitOptions.None)[0];
if(!old.Contains("Add child")) throw new Exception("Expected menu label was not found.");
load.SetJSONString(old.Replace("Add child","Prepare child…"));
var panels=shell.Widgets.OfType<ServiceStudio.Plugin.NRWidgets.IContainer>().Named("Panels");
var editor=panels.Widgets.OfType<ServiceStudio.Plugin.NRWidgets.IContainer>().Named("NodeEditor");
var help=editor.Widgets.OfType<OutSystems.Model.UI.Mobile.Widgets.ITextWidget>().First(w=>w.Text.StartsWith("Select a node in the tree"));
help.Text="Select a node in the tree or choose Prepare child… from its menu. Enter a unique New ID and label, then choose Add node. Clear Parent ID to add a root node.";
}
