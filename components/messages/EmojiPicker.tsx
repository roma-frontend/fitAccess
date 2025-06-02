// components/messages/EmojiPicker.tsx
import React, { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker = memo(({ onEmojiSelect }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const emojis = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃",
    "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙",
    "👍", "👎", "👌", "🤝", "🙏", "💪", "🎉", "🎊", "🔥", "⭐",
    "❤️", "💙", "💚", "💛", "🧡", "💜", "🖤", "🤍", "🤎", "💯"
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-8 gap-1">
          {emojis.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-lg hover:bg-gray-100"
              onClick={() => {
                onEmojiSelect(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});

EmojiPicker.displayName = "EmojiPicker";
