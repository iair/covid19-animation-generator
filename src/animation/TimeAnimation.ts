import { Animation, PlotSeries, FrameFilterInfo } from '../util/Types';
import { DateTime } from 'luxon';
import DynamicScaleGenerator from '../scale/DynamicScaleGenerator';

export default class TimeAnimation implements Animation
{
	private series: PlotSeries[];
	private frames: number;
	private days: number;
	private firstDate: DateTime;
	private lastDate: DateTime;
	private scaleGenerator: DynamicScaleGenerator;

	public constructor(series: PlotSeries[], frames: number, days: number, scaleGenerator: DynamicScaleGenerator)
	{
		// Save
		this.series = series;
		this.frames = frames;
		this.days = days;
		this.scaleGenerator = scaleGenerator;

		// Calculate
		this.lastDate = this.getLastDate();
		this.firstDate = this.getFirstDate();
	}

	public countFrames(): number
	{
		const maxDiff = Math.floor(this.lastDate.diff(this.firstDate).as('days'));
		const realDays = this.days === 0 ?
			maxDiff :
			Math.min(maxDiff, this.days - 1);

		return 1 + this.frames * realDays;
	}

	public *getFrames(): Generator<FrameFilterInfo>
	{
		// First day with ratio 1
		yield { date: this.firstDate, ratio: 1 };

		// Rest of the days
		let current = this.firstDate.plus({ days: 1 });
		while (current <= this.lastDate)
		{
			for (let frame = 1; frame <= this.frames; frame++)
				yield { date: current, ratio: frame / this.frames };
			current = current.plus({ days: 1 });
		}
	}

	public getScale(filteredSeries: PlotSeries[],
		frameFilterInfo: FrameFilterInfo,
		frameIndex: number,
		stepFrameIndex: number) {
		return this.scaleGenerator.generate(filteredSeries);
	}

	private getFirstDate()
	{
		const possibleDate = this.series[0].points[0].date;
		if (this.days === 0)
			return possibleDate;

		const requestedDate = this.lastDate.plus({ days: (-1 * this.days) + 1 });
		return DateTime.max(requestedDate, possibleDate);
	}

	private getLastDate()
	{
		const firstPoints = this.series[0].points;
		const lastIndex = firstPoints.length - 1;
		const lastDataPoint = firstPoints[lastIndex];
		return lastDataPoint.date;
	}
}
