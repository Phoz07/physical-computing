export enum EnumStatus {
  SUCCESS = "success",
  ERROR = "error",
  IDLE = "idle",
}

export default function Status({ status }: { status: EnumStatus }) {
  return (
    <span className="relative flex size-3">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
          status == EnumStatus.SUCCESS
            ? "bg-green-400"
            : status == EnumStatus.ERROR
            ? "bg-red-400"
            : "bg-zinc-400"
        }`}
      ></span>
      <span
        className={`relative inline-flex size-3 rounded-full ${
          status == EnumStatus.SUCCESS
            ? "bg-green-500"
            : status == EnumStatus.ERROR
            ? "bg-red-500"
            : "bg-zinc-500"
        }`}
      ></span>
    </span>
  );
}
