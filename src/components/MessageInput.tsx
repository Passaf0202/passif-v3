
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, PlusCircle, Send, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
              <div className="bg-muted rounded-lg p-2 pr-8">
                <span className="text-sm truncate max-w-[150px] block">
                  {file.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute top-1 right-1"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleFileSelect}
            className="rounded-full"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
          {isMobile && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCameraCapture}
              className="rounded-full"
            >
              <Camera className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Textarea
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 min-h-[44px] max-h-[120px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
        />
        <Button 
          onClick={onSendMessage} 
          disabled={!newMessage.trim() && files.length === 0}
          size="icon"
          className="rounded-full"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
