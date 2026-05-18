import Link from "next/link";

interface DeadlineCardProps {
  isAnonymous: boolean;
}

export function DeadlineCard({ isAnonymous }: DeadlineCardProps) {
  return (
    <div className="rounded-3xl bg-[#EEEDFE] p-[22px]">
      <div
        className="font-medium uppercase"
        style={{ fontSize: 12, color: "#534AB7", letterSpacing: "0.08em" }}
      >
        Next deadline
      </div>

      {isAnonymous ? (
        <div className="mt-3">
          <div
            className="font-medium"
            style={{ fontSize: 22, color: "#26215C" }}
          >
            Set your first deadline
          </div>
          <div className="mt-1" style={{ fontSize: 13, color: "#534AB7" }}>
            Track when each application is due
          </div>
          <Link
            href="/signup"
            className="mt-4 inline-block font-medium text-[#4F46E5] hover:underline"
            style={{ fontSize: 13 }}
          >
            Sign up to add →
          </Link>
        </div>
      ) : (
        <div className="mt-3">
          <div
            className="font-medium"
            style={{ fontSize: 16, color: "#26215C" }}
          >
            UPenn Early Decision
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className="font-display font-medium leading-none text-[#4F46E5]"
              style={{ fontSize: 36 }}
            >
              63
            </span>
            <span style={{ fontSize: 13, color: "#534AB7" }}>days left</span>
          </div>
        </div>
      )}
    </div>
  );
}
