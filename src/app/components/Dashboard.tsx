import BatchCard from "./BatchCard";

export default function Dashboard() {
  return (
    <div className="my-8 mx-auto flex">
        <div className="w-full justify-center items-center grid grid-cols-3 gap-12">
            <BatchCard id="1" title="Batch 1" type="Melomel" stage="Primary" image="/img/banana_mead.jpg" abv={10} favourite={true} createdAt={new Date()} lastCheckedAt={new Date()} OG={1.050} FG={1.010} />
            <BatchCard id="2" title="Batch 2" type="Melomel" stage="Primary" image="/img/banana_mead.jpg" abv={10} favourite={true} createdAt={new Date()} lastCheckedAt={new Date(new Date().setDate(new Date().getDate() - 5))} OG={1.050} FG={1.010} />
            <BatchCard id="3" title="Batch 3" type="Melomel" stage="Primary" image="/img/banana_mead.jpg" abv={10} favourite={true} createdAt={new Date()} lastCheckedAt={new Date()} OG={1.050} FG={1.010} />
        </div>
    </div>
  );
}