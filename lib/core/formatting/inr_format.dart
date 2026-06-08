/// Lightweight INR display without adding `intl`.
String formatInr(int amount) {
  final s = amount.abs().toString();
  final buf = StringBuffer();
  var group = 0;
  for (var i = s.length - 1; i >= 0; i--) {
    if (group == 3) {
      buf.write(',');
      group = 0;
    }
    buf.write(s[i]);
    group++;
  }
  final reversed = buf.toString().split('').reversed.join();
  return '₹$reversed';
}
