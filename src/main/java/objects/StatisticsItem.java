package objects;

@SuppressWarnings("unused")
public class StatisticsItem {
	
	private int n;
	private Integer[] counts;
	private String mean;
	private String standardDeviation;
	private Integer median;
	private Integer quantile025;
	private Integer quantile075;
	private String[] feedbacks;
	
	public StatisticsItem(int n, Integer[] counts,
			String mean, String sd, Integer median, Integer quantile025, Integer quantile075, String[] feedbacks) {
		this.n = n;
		this.counts = counts;
		this.mean = mean;
		this.standardDeviation = sd;
		this.median = median;
		this.quantile025 = quantile025;
		this.quantile075 = quantile075;
		this.feedbacks = feedbacks;
	}

}
