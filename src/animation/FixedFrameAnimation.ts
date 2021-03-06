
import { Animation, PlotSeries, FrameFilterInfo } from '../util/Types';

export default class FixedFrameAnimation implements Animation
{
	private frames: number;
	private frameFilterInfo: FrameFilterInfo;

	public constructor(series: PlotSeries[], frames: number)
	{
		this.frames = frames;
		const date = this.getLastDate(series);
		this.frameFilterInfo = { date, ratio: 1 };
	}
	public countFrames(): number
	{
		return this.frames;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		for (let current = 1; current <= this.frames; current++)
			yield this.frameFilterInfo;
	}


	// Private methods

	private getLastDate(series: PlotSeries[])
	{
		const firstPoints = series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
