export const MessageDisplay = ({ message }) => {
  return (
    <div className="rounded-2xl bg-neutral-800 border border-neutral-700 px-4 w-full py-2 text-center">
      <p className="text-neutral-100 text-base">{message}</p>
    </div>
  );
};
