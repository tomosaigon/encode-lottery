import { BlockProps } from "baseui/block";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { MessageCard } from "baseui/message-card";
import type { NextPage } from "next";
import AdminLottery from "~~/components/AdminLottery";
import ClaimPrize from "~~/components/ClaimPrize";
import ExchangeTokens from "~~/components/ExchangeTokens";
import { MetaHeader } from "~~/components/MetaHeader";
import PlaceBet from "~~/components/PlaceBet";
import RunLottery from "~~/components/RunLottery";

const itemProps: BlockProps = {
  // backgroundColor: 'mono300',
  // height: 'scale1000',
  // display: 'flex',
  // alignItems: 'center',
  // justifyContent: 'center',
};

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="m-10">
          <MessageCard
            heading="Welcome to Encode Club Lottery for Winners"
            buttonLabel="YOLO"
            onClick={() => alert("scroll down")}
            paragraph="Spend your Ether now for a chance to win. YOLO!"
            image={{
              src: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2670&q=80",
              ariaLabel: "Image description",
            }}
          />
        </div>

        <FlexGrid flexGridColumnCount={3} flexGridColumnGap="scale800" flexGridRowGap="scale800">
          <FlexGridItem {...itemProps}>
            <ExchangeTokens />
          </FlexGridItem>
          <FlexGridItem {...itemProps}>
            <PlaceBet />
          </FlexGridItem>
          <FlexGridItem {...itemProps}>
            <ClaimPrize />
          </FlexGridItem>
        </FlexGrid>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <RunLottery />
            <AdminLottery />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
