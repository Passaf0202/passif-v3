import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, PlusCircle, Send } from "lucide-react";

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
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => onFileChange(e as React.ChangeEvent<HTMLInputElement>);
    input.click();
  };

  return (
    <div className="p-4 border-t bg-white sticky bottom-0">
      <div className="flex gap-2">
        <input
          type="file"
          id="file-input"
          multiple
          onChange={onFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />
        <div className="flex gap-2">
          <label htmlFor="file-input">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </label>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCameraCapture}
          >
            <Camera className="h-4 w-4" />
          </Button>
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