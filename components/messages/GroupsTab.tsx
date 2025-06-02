// components/messages/GroupsTab.tsx
import React, { memo } from "react";
import { MessageGroup } from "@/types/messages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Plus } from "lucide-react";

interface GroupsTabProps {
  groups: MessageGroup[];
  onCreateGroup: () => void;
  onMessageGroup: (groupId: string) => void;
  onManageGroup: (groupId: string) => void;
}

export const GroupsTab = memo(({
  groups,
  onCreateGroup,
  onMessageGroup,
  onManageGroup
}: GroupsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <GroupCard
          key={group._id}
          group={group}
          onMessage={() => onMessageGroup(group._id)}
          onManage={() => onManageGroup(group._id)}
        />
      ))}

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center h-full min-h-[200px]">
          <Button variant="outline" onClick={onCreateGroup} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Создать группу
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

const GroupCard = memo(({
  group,
  onMessage,
  onManage
}: {
  group: MessageGroup;
  onMessage: () => void;
  onManage: () => void;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        {group.name}
      </CardTitle>
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {group.memberIds.length} участников
        </Badge>
        <Badge variant={group.isActive ? "default" : "secondary"}>
          {group.isActive ? "Активна" : "Неактивна"}
        </Badge>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600 mb-4">
        {group.description}
      </p>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium mb-2">Участники:</h4>
          <div className="flex flex-wrap gap-1">
            {group.memberNames.slice(0, 3).map((name, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {name}
              </Badge>
            ))}
            {group.memberNames.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{group.memberNames.length - 3} еще
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={onMessage} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Написать группе
          </Button>
          <Button size="sm" variant="outline" onClick={onManage}>
            Управление
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
));

GroupsTab.displayName = "GroupsTab";
