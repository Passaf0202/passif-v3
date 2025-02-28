
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, File, PlusCircle, Send, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  files: File[];
}

export function MessageInput({
  newMessage,
  onMessageChange,
  onSendMessage,
  onFileChange,
  files,
}: MessageInputProps) {
  const isMobile = useIsMobile();
  const [focused, setFocused] = useState(false);

  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = isMobile ? 'image/*' : 'image/*,.pdf,.doc,.docx';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target && target.files) {
        const event = {
          target: target,
        } as React.ChangeEvent<HTMLInputElement>;
        onFileChange(event);
      }
    };
    input.click();
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target && target.files) {
        const event = {
          target: target,
        } as React.ChangeEvent<HTMLInputElement>;
        onFileChange(event);
      }
    };
    input.click();
  };

  const removeFile = (index: number) => {
    const newFiles = Array.from(files);
    newFiles.splice(index, 1);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    onFileChange({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="p-4 border-t bg-white sticky bottom-0 space-y-3">
      {files.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from(files).map((file, index) => (
            <div key={index} className="relative flex-shrink-0">
              <div className="bg-gray-100 rounded-lg p-2 pr-8 flex items-center gap-2">
                <File className="h-4 w-4 text-gray-500" />
                <span className="text-sm truncate max-w-[150px] block">
                  {file.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute top-1 right-1 bg-white rounded-full"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "flex gap-2 items-end transition-all bg-gray-50 rounded-2xl pr-2",
        focused ? "border-2 border-primary/20" : "border border-gray-200"
      )}>
        <div className="flex gap-2 p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleFileSelect}
            className="rounded-full h-8 w-8 text-gray-500 hover:text-primary hover:bg-gray-200"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
          {isMobile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCameraCapture}
              className="rounded-full h-8 w-8 text-gray-500 hover:text-primary hover:bg-gray-200"
            >
              <Camera className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Textarea
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-2 py-3"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Button 
          onClick={onSendMessage} 
          disabled={!newMessage.trim() && files.length === 0}
          size="icon"
          className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90 text-white flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
