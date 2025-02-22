import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, PlusCircle, Send } from "lucide-react";
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

  return (
    <div className="p-4 border-t bg-white sticky bottom-0">
      <div className="flex gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleFileSelect}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          {isMobile && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCameraCapture}
            >
              <Camera className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Textarea
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
        />
        <Button onClick={onSendMessage} disabled={!newMessage.trim() && files.length === 0}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {files.length > 0 && (
        <div className="text-sm text-muted-foreground mt-2">
          {files.length} fichier(s) sélectionné(s)
        </div>
      )}
    </div>
  );
}